# import requests

# base_url = "http://localhost:8000"

# # Basic App and Router Test
# print("##### Testing basic app and router #####")
# print(requests.get(f"{base_url}/").json())
# print(requests.get(f"{base_url}/dashboard/ping").json())
# print(requests.get(f"{base_url}/sahayak/ping").json())
# print(requests.get(f"{base_url}/calendar/ping").json())
# print(requests.get(f"{base_url}/quiz/ping").json())

# print("\n\n")

# print("##### Testing Sahayak APIs #####")

# # print(requests.get(f"{base_url}/sahayak/get_deployment").json())

# print(requests.get(f"{base_url}/sahayak/create_deployment").json())
# print(requests.get(f"{base_url}/sahayak/get_deployment").json())
# print(requests.delete(f"{base_url}/sahayak/delete_deployment").json())



# print(requests.post(f"{base_url}/sahayak/create_session", params={"user_id": "user0001"}).json())
# # {'session_id': '511002976811220992'}

# print(requests.get(f"{base_url}/sahayak/get_sessions", params={"user_id": "user0001"}).json())
# # {
# #     'sessions': [{'appName': '7665223322807828480', 'id': '511002976811220992', 'state': {}, 'userId': 'user0001', 'events': [], 'lastUpdateTime': 1753292871.710051}], 
# #     'messages': []
# # }


# print(requests.get(f"{base_url}/sahayak/get_session_message", params={"user_id": "user0001", "session_id":"5008973104647503872"}).json())
# print(requests.delete(f"{base_url}/sahayak/delete_session", params={"user_id": "user0001", "session_id":""}).json())
# print(requests.get(f"{base_url}/sahayak/get_answer", params={"user_id": "user0001", "session_id":"5008973104647503872", "message":""}).json())

# # print(requests.delete(f"{base_url}/sahayak/delete_session", params={"user_id": "user0001", "session_id":"9f30143e-00be-4b28-baab-9833a8efd1c2"}).json())


