# import os
# import firebase_admin
# from firebase_admin import credentials, firestore

# # === Firestore Setup ===
# JSON_KEY_PATH = os.path.join(os.getcwd(), "..", "..", "attendance_sync", "sahayakai-466006-23c8bb0bf069.json")
# if not firebase_admin._apps:
#     firebase_cred = credentials.Certificate(JSON_KEY_PATH)
#     firebase_admin.initialize_app(firebase_cred)
# db = firestore.client()

# def get_attendance(class_name: str, date: str) -> dict:
#     """Get the attendance record for a class and date.
#     Args:
#         class_name (str): The class name (e.g., '9A').
#         date (str): The date in DD-MM-YYYY format.
#     Returns:
#         dict: Mapping of student names to their attendance status.
#     """
#     doc_ref = db.collection("attendance").document(class_name).collection("dates").document(date)
#     doc = doc_ref.get()
#     if doc.exists:
#         return doc.to_dict()
#     return {}

# def get_absentees(class_name: str, date: str) -> list:
#     """List students who were absent for a class and date.
#     Args:
#         class_name (str): The class name.
#         date (str): The date in DD-MM-YYYY format.
#     Returns:
#         list: List of absent students.
#     """
#     attendance = get_attendance(class_name, date)
#     return [student for student, status in attendance.items() if status.lower() == "absent"]

# def get_presentees(class_name: str, date: str) -> list:
#     """List students who were present for a class and date.
#     Args:
#         class_name (str): The class name.
#         date (str): The date in DD-MM-YYYY format.
#     Returns:
#         list: List of present students.
#     """
#     attendance = get_attendance(class_name, date)
#     return [student for student, status in attendance.items() if status.lower() == "present"]

# def was_present(class_name: str, date: str, student: str) -> bool:
#     """Check if a student was present on a given date in a class.
#     Args:
#         class_name (str): The class name.
#         date (str): The date in DD-MM-YYYY format.
#         student (str): The student's name.
#     Returns:
#         bool: True if present, False otherwise.
#     """
#     attendance = get_attendance(class_name, date)
#     for key in attendance:
#         if student.lower() in key.lower():
#             return attendance[key].lower() == "present"
#     return False

# def update_attendance(class_name: str, date: str, student: str, status: str) -> bool:
#     """Update a student's attendance for a class and date.
#     Args:
#         class_name (str): The class name.
#         date (str): The date in DD-MM-YYYY format.
#         student (str): The student's name.
#         status (str): The new attendance status (e.g., 'Present', 'Absent').
#     Returns:
#         bool: True if updated, False otherwise.
#     """
#     doc_ref = db.collection("attendance").document(class_name).collection("dates").document(date)
#     doc = doc_ref.get()
#     if not doc.exists:
#         return False
#     attendance = doc.to_dict()
#     for key in attendance:
#         if student.lower() in key.lower():
#             attendance[key] = status
#             doc_ref.set(attendance, merge=True)
#             return True
#     return False

# def add_attendance(class_name: str, date: str, student: str, status: str) -> bool:
#     """Add a student's attendance for a class and date.
#     Args:
#         class_name (str): The class name.
#         date (str): The date in DD-MM-YYYY format.
#         student (str): The student's name.
#         status (str): The attendance status (e.g., 'Present', 'Absent').
#     Returns:
#         bool: True if added, False otherwise.
#     """
#     doc_ref = db.collection("attendance").document(class_name).collection("dates").document(date)
#     doc_ref.set({student: status}, merge=True)
#     return True

# def delete_attendance(class_name: str, date: str, student: str) -> bool:
#     """Delete a student's attendance record for a class and date.
#     Args:
#         class_name (str): The class name.
#         date (str): The date in DD-MM-YYYY format.
#         student (str): The student's name.
#     Returns:
#         bool: True if deleted, False otherwise.
#     """
#     doc_ref = db.collection("attendance").document(class_name).collection("dates").document(date)
#     doc = doc_ref.get()
#     if not doc.exists:
#         return False
#     attendance = doc.to_dict()
#     for key in list(attendance.keys()):
#         if student.lower() in key.lower():
#             del attendance[key]
#             doc_ref.set(attendance)
#             return True
#     return False

# def student_history(class_name: str, student: str) -> dict:
#     """Get the attendance history for a student in a class.
#     Args:
#         class_name (str): The class name.
#         student (str): The student's name.
#     Returns:
#         dict: Mapping of dates to attendance status for the student.
#     """
#     dates_ref = db.collection("attendance").document(class_name).collection("dates")
#     docs = dates_ref.stream()
#     history = {}
#     student_clean = student.strip().lower()
#     for doc in docs:
#         data = doc.to_dict()
#         for key in data:
#             # Remove roll number prefix if present (e.g., '2. StudentB' -> 'StudentB')
#             key_name = key.split('. ', 1)[-1].strip().lower() if '. ' in key else key.strip().lower()
#             # Debug: print all keys being checked
#             # print(f"Checking key: '{key}' (parsed: '{key_name}') against '{student_clean}'")
#             if student_clean == key_name:
#                 history[doc.id] = data[key]
#     # Debug: print the computed history
#     # print(f"Computed history for {student} in {class_name}: {history}")
#     return history

# def attendance_percentage(class_name: str, student: str) -> float:
#     """Get the attendance percentage for a student in a class.
#     Args:
#         class_name (str): The class name.
#         student (str): The student's name.
#     Returns:
#         float: Attendance percentage (0-100).
#     """
#     history = student_history(class_name, student)
#     total = len(history)
#     present = sum(1 for status in history.values() if status.lower() == "present")
#     # Debug: print attendance calculation
#     # print(f"Attendance percentage for {student} in {class_name}: {present}/{total}")
#     return (present / total * 100) if total > 0 else 0
