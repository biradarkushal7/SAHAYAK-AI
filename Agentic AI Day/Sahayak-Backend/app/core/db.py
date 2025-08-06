# import asyncio
# import logging
# from google.adk.sessions import DatabaseSessionService
# from sqlalchemy.exc import SQLAlchemyError

# from app.core.config import settings

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)


# class PGDatabase:
#     def __init__(self):
#         self.db_service = DatabaseSessionService(db_url=f"postgresql://{settings.db_user}:{settings.db_password}@{settings.db_host}:{settings.db_port}/{settings.db_name}")
#         self.initial_state = {"user_name": "Brandon Hancock", "reminders": []}

#     # Done
#     async def create_new_session(self, user_id: str):
#         """Create a new session with initial state"""
#         try:
#             new_session = await self.db_service.create_session(
#                 app_name=settings.app_name,
#                 user_id=user_id,
#                 state=self.initial_state
#             )
#             print(f"DB -- New session created: {new_session}")
#             return new_session.id
#         except SQLAlchemyError as e:
#             logger.error(f"Error creating session: {e}")
#             return None

#     # Done
#     async def get_sessions(self, user_id: str):
#         """Get all sessions for a given app and user"""
#         try:
#             sessions = await self.db_service.list_sessions(
#                 app_name=settings.app_name, user_id=user_id
#             )
#             if len(sessions.model_dump()['sessions']) > 0:
#                 sessions = sessions.model_dump()['sessions']
#                 sessions = sorted(sessions, reverse=True, key=lambda x: x["last_update_time"])
#                 return sessions
#             return []
#         except SQLAlchemyError as e:
#             logger.error(f"Error fetching sessions: {e}")
#             return []

#     # Done
#     async def get_session_messages(self, user_id: str, session_id: str):
#         """Get messages for a specific session"""
#         messages = []
#         try:
#             session = await self.db_service.get_session(
#                 app_name=settings.app_name, user_id=user_id, session_id=session_id
#             )
#             if session: # and hasattr(session, "events"):
#                 for event in session.events:
#                     if event.content.parts[0].text is not None:
#                         messages.append({
#                             "role": event.content.role,
#                             "text": event.content.parts[0].text
#                         })
#             return messages
#         except SQLAlchemyError as e:
#             logger.error(f"Error fetching session messages: {e}")
#             return []

#     async def delete_user_session(self, user_id: str, session_id: str):
#         """Delete a session by ID"""
#         try:
#             user_sessions = await self.get_sessions(user_id)
#             print(f">>>> user sessions {user_sessions}")
#             if len(user_sessions) > 0:
#                 user_session = [ x['id'] for x in user_sessions if x['id'] == session_id ]
#                 if len(user_session) > 0:
#                     await self.db_service.delete_session(app_name=settings.app_name, user_id=user_id, session_id=session_id)
#                     logger.info(f"Session {session_id} deleted for user {user_id}")
#                     return f"deleted"
#                 else:
#                     logger.warning(f"Session {session_id} not found for user {user_id}")
#                     return f"Session {session_id} not found for user {user_id}"
#             else:
#                 logger.warning(f"No sessions found for user {user_id} to delete")
#                 return f"No sessions found for user {user_id} to delete"
#             # await self.db_service.delete_session(session_id=session_id)
#         except SQLAlchemyError as e:
#             logger.error(f"Error deleting session: {e}")

#     async def close_session(self, session_id: str):
#         """Close a session by ID"""
#         try:
#             await self.db_service.close_session(session_id=session_id)
#         except SQLAlchemyError as e:
#             logger.error(f"Error closing session: {e}")

#     def close(self):
#         # Reserved for future use if connection cleanup is needed
#         pass



