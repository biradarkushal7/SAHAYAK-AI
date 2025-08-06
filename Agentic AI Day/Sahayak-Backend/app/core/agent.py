import vertexai
from vertexai.preview import reasoning_engines
from vertexai import agent_engines
from typing import Optional, List, Any

# from app.a_basic_agent.agent import basic_agent
from app.manager.agent import root_agent as basic_agent

from app.core.config import settings
# from app.core.db import PGDatabase


class AgentEngine:
    def __init__(self):
        """Initialize the Agent Engine with project details."""
        vertexai.init(project="storied-radius-466418-t8", location="us-central1", staging_bucket="gs://adk-test-bucket-001")
        self.resource_id = None
        self.remote_app  = None

        deployments = agent_engines.list()
        try:
            current_deployment = list(deployments)[0]
            print("Existing deployments found. Using the first one.")
            self.resource_id = current_deployment.resource_name.split('/')[-1]
            self.remote_app  = agent_engines.get(self.resource_id)
        except IndexError:
            print("No existing deployments found. Creating a new deployment...")
            app        = reasoning_engines.AdkApp(agent=basic_agent,enable_tracing=True,)
            remote_app = agent_engines.create(
                            agent_engine  = app,
                            requirements  = ["google-cloud-aiplatform[adk,agent_engines]", "cloudpickle", "pydantic"],
                            extra_packages= ["./app/manager"]
                        )
            self.resource_id = remote_app.resource_name.split('/')[-1]
            self.remote_app  = agent_engines.get(self.resource_id)

    def create_deployment(self):
        app = reasoning_engines.AdkApp(agent=basic_agent,enable_tracing=True,)
        remote_app = agent_engines.create(
                        agent_engine  = app,
                        requirements  = ["google-cloud-aiplatform[adk,agent_engines]", "cloudpickle", "pydantic"],
                        extra_packages= ["./app/manager"]
                    )
        self.resource_id = remote_app.resource_name.split('/')[-1]
        self.remote_app  = agent_engines.get(self.resource_id)
        return self.resource_id

    def get_deployment(self):
        if self.resource_id:
            return self.resource_id
        else:
            return None


    def delete(self) -> dict:
        """For Admin to delete an existing deployment"""
        # remote_app = agent_engines.get(self.resource_id)
        self.remote_app.delete(force=True)
        print(f"Deleted remote app: {self.resource_id}")

        deleted_r_id     = self.resource_id
        self.resource_id = None
        self.remote_app  = None
        return {"message":f"Resource {deleted_r_id} deleted successfully."}



    def create_user_session(self, user_id: str) -> dict:
        # remote_app = agent_engines.get(self.resource_id)
        n_session  = self.remote_app.create_session(
            user_id=user_id, 
            state={
                "user name": "user", 
                "to-do reminders":[], 
                "exam-important":[]
            }
        )
        # return {'id':n_session['id'], 'user_id':n_session['user_id'], 'app_name':n_session['app_name'], 'last_update_time':n_session['last_update_time']}
        return n_session['id']

    def fetch_session_messages(self, user_id: str, session_id: str) -> list:
        """
        Fetch and parse messages from a given session for a user.

        Args:
            user_id (str): The user ID.
            session_id (str): The session ID.

        Returns:
            list: A list of parsed messages from the session.
                Each message is a dict with role, author, text, and timestamp.
        """
        session_data = self.remote_app.get_session(user_id=user_id, session_id=session_id)
        events       = session_data.get("events", [])
        print("\n\n\n")
        print(" ========== Event Data ========== ")
        print(events)
        print(" ========== Event Data ========== ")
        print("\n\n\n")


        messages = []
        for event in events:
            content = event.get("content", {})
            parts   = content.get("parts", [])
            role    = content.get("role", event.get("model"))
            for part in parts:
                text = part.get("text")
                if text:
                    messages.append({
                        "role": role,
                        "message": text
                    })
        return messages

    def list_user_sessions_w_messages(self, user_id: str) -> dict:
        """
        Retrieve and sort the user's sessions by lastUpdateTime (descending).
        If no sessions exist, create one and re-fetch.

        Also fetches messages for the most recent session.

        Args:
            user_id (str): The ID of the user.

        Returns:
            dict: A dictionary with:
                - 'sessions': sorted session list
                - 'messages': messages from the most recent session (if any)
        """
        # remote_app = agent_engines.get(self.resource_id)
        u_sessions = self.remote_app.list_sessions(user_id=user_id)
        sessions   = u_sessions.get("sessions", [])
        if not sessions:
            self.create_user_session(user_id)
            print(f"New Session created for user {user_id}")
            u_sessions = self.remote_app.list_sessions(user_id=user_id)
            sessions = u_sessions.get("sessions", [])
        else:
            print(f"Session available for user {user_id}")

        # Sort sessions by lastUpdateTime descending
        print("Sorting sessions")
        sessions.sort(key=lambda s: s.get("lastUpdateTime", 0), reverse=True)

        # Fetch messages for the most recent session if available
        messages = []
        if sessions:
            latest_session_id = sessions[0].get("id")
            if latest_session_id:
                messages = self.fetch_session_messages(user_id=user_id, session_id=latest_session_id)
        return {"sessions": sessions, "messages": messages}



    def delete_session(self, user_id: str, session_id: str):
        try:
            self.remote_app.delete_session(user_id=user_id, session_id=session_id)
            return {"message":"session deleted"}
        except Exception as e:
            return {"message": "incorrect session details"}

    # def send_query(self, user_id: str, session_id: str, message: str) -> dict:
    #     """
    #     Sends a message to the assistant using streaming and returns the final model response.

    #     Args:
    #         user_id (str): The user ID.
    #         session_id (str): The session ID for the conversation context.
    #         message (str): The input message to send.

    #     Returns:
    #         dict: A dictionary with:
    #             - 'message': The full response text from the model.
    #             - 'role': The role of the responder (always 'model').
    #     """
    #     response_parts = []

    #     for chunk in self.remote_app.stream_query(user_id=user_id, session_id=session_id, message=message):
    #         for part in chunk.get("content", {}).get("parts", []):
    #             text = part.get("text")
    #             if text:
    #                 response_parts.append(text)

    #     return {
    #         "message": "".join(response_parts),
    #         "role": "model"
    #     }

    def send_query(
            self,
            user_id: str,
            session_id: str,
            message: str,
            attachment_b64: Optional[str] = None,       # This is the Base64 string from get_answer (GCS fetch)
            attachment_mime_type: Optional[str] = None, # This is the MIME type from get_answer (GCS fetch)
            **kwargs_to_agent: Any                      # For additional parameters like target_audience etc.
        ) -> dict:
            response_parts = []
            adk_content_parts = []
 
            if message:
                adk_content_parts.append({"text": message})
 
            if attachment_b64:
                # If attachment_mime_type is missing, default to octet-stream
                detected_mime_type = attachment_mime_type if attachment_mime_type else 'application/octet-stream'
 
                adk_content_parts.append(
                    {
                        "inline_data": {                                   
                            "data": attachment_b64,
                            "mime_type": detected_mime_type
                        }
                    }
                )
 
            if not adk_content_parts:
                raise ValueError("No message or attachment provided to send to the agent.")

            query_input_to_adk = None
            if adk_content_parts:
                query_input_to_adk = {"role": "user", "parts": adk_content_parts}
            elif message:
                query_input_to_adk = message
            else:
                raise ValueError("No message or attachment provided to send to the agent.")


            for chunk in self.remote_app.stream_query(
                user_id=user_id,
                session_id=session_id,
                #aditya : 03:34 : fix message error : gemini says 'message' argument is MISSING here!
                # message=message, # This is the text input message (always required by this endpoint)
                # contents=[
                # message=[
                #     {
                #         "role": "user",
                #         "parts": adk_content_parts
                #     }
                # ],
                message=query_input_to_adk,
                **kwargs_to_agent # Pass additional keyword arguments here
            ):
                for part in chunk.get("content", {}).get("parts", []):
                    text = part.get("text")
                    if text:
                        response_parts.append(text)
 
            return {
                "message": "".join(response_parts),
                "attachments":{"video_links":[], "articles":[]}, 
                "role": "model"
            }







