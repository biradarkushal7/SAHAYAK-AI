import os
import json
from fastapi import APIRouter, Request, HTTPException
from fastapi import FastAPI, File, UploadFile, Form, HTTPException

from google.cloud import storage
# from google.api_core import exceptions
from google.auth.exceptions import DefaultCredentialsError

# from fastapi import Form, File, UploadFile
from typing import Optional
from app.core.agent import AgentEngine

router = APIRouter(prefix="/sahayak", tags=["Sahayak"])

GCS_BUCKET_NAME = os.environ.get("GCS_BUCKET_NAME", "sahayak-demo-001")
try:
    storage_client = storage.Client()
    bucket = storage_client.bucket(GCS_BUCKET_NAME)
# except exceptions.DefaultCredentialsError:
except DefaultCredentialsError:
    print("Authentication Error: Please configure your Google Cloud credentials.")
    print("You can run 'gcloud auth application-default login' in your terminal.")
    storage_client = None
    bucket = None

# db_service    = PGDatabase()
agent = AgentEngine()


@router.get("/ping")
async def sahayak_ping():
    return {"message": "Sahayak API is working."}

@router.post("/create_deployment")
async def create_new_deployment():
    try:
        resource_id = agent.create_deployment()
        if resource_id:
            return {"message":"New deployment Created!", 'resource_id':resource_id}
        else:
            return {"message":"Unknown Error in creating deployment! Please contact Admin.", 'resource_id':''}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create deployment")

# Done
@router.get("/get_deployment")
async def get_deployment():
    try:
        resource_id = agent.get_deployment()
        if resource_id:
            return {"message":"Deployment available", 'resource_id':resource_id}
        else:
            return {"message":"No deployment available.", 'resource_id':''}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get deployment details")

# 
@router.delete("/delete_deployment")
async def delete_deployment():
    try:
        return agent.delete()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete deployment")



@router.post("/create_session")
async def create_session(user_id: str):
    try:
        new_session = agent.create_user_session(user_id)
        return {"session_id": new_session}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session - {str(e)}")

@router.get("/get_sessions")
async def list_sessions(user_id: str):
    """
    List all sessions for a given user.
    Args:
        user_id (str): The ID of the user for whom to list sessions.
    Returns:
        dict: A dictionary containing a list of sessions.
    Testing: 
        Done
    """
    try:
        return agent.list_user_sessions_w_messages(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch session list - {str(e)}")

# Done
@router.get("/get_session_message")
async def get_session(user_id: str, session_id: str):
    try:
        messages = agent.fetch_session_messages(user_id, session_id)
        return {"messages": messages}
    except Exception as e:
        print(f"{session_id} :: exception - {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve session - {str(e)}")

# Done
@router.delete("/delete_session")
async def delete_session(user_id: str, session_id: str):
    try:
        return agent.delete_session(user_id, session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete session - {str(e)}")

# # Done
# @router.post("/get_answer")
# # async def get_answer(user_id: str, session_id: str, message: str, **kwargs):
# async def get_answer(request: Request):
#     data = await request.json()
#     user_id: Optional[str] = data.get("user_id")
#     session_id: Optional[str] = data.get("session_id")
#     message: Optional[str] = data.get("message", "Hi")
#     # customization: Optional[str] = data.get("customization")
    
#     attachment: Optional[str] = data.get("attachment", "")
    
#     targetaudience: Optional[list] = data.get("targetAudience", [])
#     responsetone: Optional[str] = data.get("responseTone", "")
#     complexitylevel: Optional[str] = data.get("complexityLevel", "")

#     # Parse customization if present
    

#     if attachment:
#         print(f"Received attachment (string): {attachment}")

#     response = agent.send_query(user_id, session_id, message)
#     return response



# 22:47
@router.post("/get_answer")
async def get_answer(request: Request):
    print("Entering get_answer route")
    data = await request.json()
    user_id: Optional[str] = data.get("user_id")
    session_id: Optional[str] = data.get("session_id")
    message: Optional[str] = data.get("message")
    
    print(f"Msg: {message}")
    attachment: Optional[str] = data.get("attachment") # This is the file's object name (e.g., "my_document.pdf")
    print(f"Attach: {attachment}")
    targetaudience: Optional[list] = data.get("targetAudience")
    responsetone: Optional[str] = data.get("responseTone")
    complexitylevel: Optional[str] = data.get("complexityLevel")
 
    attachment_b64_string = None
    attachment_mime_type_detected = None
 
    STATIC_GCS_BUCKET_URI_PREFIX = "gs://adk-test-bucket-005" # update this
 
 
    if attachment and user_id:
        try:
            # Construct full GCS object paths based on user_id and folder structure
            source_gcs_object = f"{user_id}/chat/uploaded/{attachment}"
            destination_gcs_object = f"{user_id}/chat/processed/{attachment}"
 
            bucket_name = STATIC_GCS_BUCKET_URI_PREFIX[len("gs://"):]
 
            storage_client = storage.Client()
            bucket = storage_client.bucket(bucket_name)
 
            source_blob = bucket.blob(source_gcs_object)
            destination_blob = bucket.blob(destination_gcs_object)
 
            if not source_blob.exists():
                raise HTTPException(status_code=404, detail=f"File '{attachment}' not found in 'uploaded' folder for user {user_id}.")
 
            # Move the file from 'uploaded' to 'processed'
            token = None
            while True:
                token, bytes_rewritten, bytes_to_rewrite = destination_blob.rewrite(
                    source_blob, token=token
                )
                if token is None:
                    break
            source_blob.delete()
 
            # Fetch content from the new 'processed' location
            file_content_bytes = destination_blob.download_as_bytes()
 
            attachment_b64_string = base64.b64encode(file_content_bytes).decode('utf-8')
 
            attachment_mime_type_detected, _ = mimetypes.guess_type(attachment)
            if not attachment_mime_type_detected:
                attachment_mime_type_detected = 'application/octet-stream'
                print("Detected MIME type: NO")

            print("Detected MIME type:", attachment_mime_type_detected)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to process GCS attachment for user {user_id}: {e}")
 
    # Add the additional metadata to the message
    if targetaudience is not None:
        # additional_query_params["target_audience"] = targetaudience
        message = message + f"\nTarget Audience will be: {', '.join(targetaudience)}"
    if responsetone is not None:
        # additional_query_params["response_tone"] = responsetone
        message = message + f"\nResponse Tone has to be: {responsetone}"
    if complexitylevel is not None:
        # additional_query_params["complexity_level"] = complexitylevel
        message = message + f"\nComplexity Level has to be: {complexitylevel}"
    if user_id is not None:
        message = message + f"\nUser ID: {user_id}"
    # if class is not None:
    #     message = message + f"\nClass: {class}"
    # if syllabus is not None:
    #     message = message + f"\nSyllabus: {syllabus}"    

    try:
        response = agent.send_query(
            user_id=user_id,
            session_id=session_id,
            message=message,
            attachment_b64=attachment_b64_string,
            attachment_mime_type=attachment_mime_type_detected,
        )
        print(f"Response: {response}")
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get answer: {e}")
 


def create_user_directory_structure(user_id: str):
    """Create the required folder structure for a new user."""
    base_paths = [
        f"{user_id}/chat/uploaded/",
        f"{user_id}/chat/processed/",
        f"{user_id}/generation/"
    ]
    for path in base_paths:
        # Upload a dummy file to simulate directory (optional: can also be a .keep file)
        blob = bucket.blob(f"{path}.keep")
        if not blob.exists():
            blob.upload_from_string('')  # Empty content

@router.post("/upload_file")
async def upload_file(
    user_id: str = Form(...),
    session_id: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Handles file uploads from users, storing them in a structured directory
    within a Google Cloud Storage bucket.
    Directory Structure in GCS:
    {user_id}/chat/uploaded/{filename}
    """
    if not bucket:
        raise HTTPException(
            status_code=500, 
            detail="Google Cloud Storage client is not initialized. Check server logs for details."
        )
    try:
        create_user_directory_structure(user_id)
        
        # Define the destination path (blob name) within the bucket.
        blob_name = f"{user_id}/chat/uploaded/{file.filename}"
        blob      = bucket.blob(blob_name)
        blob.upload_from_file(file.file)
        return {
            "success": True,
            "filename": file.filename,
            "gcs_uri": f"gs://{GCS_BUCKET_NAME}/{blob_name}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during upload: {str(e)}")









