# import os
# import firebase_admin
# from firebase_admin import credentials, firestore
# from google.adk.agents import Agent

# # === Firestore Setup ===
# JSON_KEY_PATH = os.path.join(os.getcwd(), "..", "attendance_sync", "sahayakai-466006-23c8bb0bf069.json")
# if not firebase_admin._apps:
#     firebase_cred = credentials.Certificate(JSON_KEY_PATH)
#     firebase_admin.initialize_app(firebase_cred)
# db = firestore.client()


# # === Attendance Tools ===
# from .tools.attendance_tools import (
#     get_attendance,
#     get_absentees,
#     get_presentees,
#     was_present,
#     update_attendance,
#     add_attendance,
#     delete_attendance,
#     student_history,
#     attendance_percentage,
# )

# # === Agent Configuration ===
# root_agent = Agent(
#     name="attendance_ease",
#     model="gemini-2.0-flash",
#     description="Agent to help with attendance monitoring and correction operations.",
#     instruction=f"""
# You are Attendance Monitor, a helpful assistant that can perform various tasks helping with attendance management and correction for school classes.

# ## Attendance operations
# You can perform attendance operations directly using these tools:
# - `get_attendance`: Get the attendance record for a class and date
# - `get_absentees`: List students who were absent for a class and date
# - `get_presentees`: List students who were present for a class and date
# - `was_present`: Check if a student was present on a given date in a class
# - `update_attendance`: Update a student's attendance for a class and date
# - `add_attendance`: Add a student's attendance for a class and date
# - `delete_attendance`: Delete a student's attendance record for a class and date
# - `student_history`: Get the attendance history for a student in a class
# - `attendance_percentage`: Get the attendance percentage for a student in a class

# ## Be proactive and concise
# Be proactive when handling attendance requests. Don't ask unnecessary questions when the context or defaults make sense.

# For example:
# - If the user asks about absentees without specifying a date, use today's date.
# - If the user asks about a student without specifying a class, ask for the class.

# When mentioning today's date to the user, prefer the format DD-MM-YYYY.

# ## Guidelines
# - Only return the information requested (not extra information).
# - NEVER show the raw response from a tool_outputs. Instead, use the information to answer the question.
# - NEVER show ```tool_outputs...``` in your response.
# """,
#     tools=[
#         get_attendance,
#         get_absentees,
#         get_presentees,
#         was_present,
#         update_attendance,
#         add_attendance,
#         delete_attendance,
#         student_history,
#         attendance_percentage,
#     ],
# )
