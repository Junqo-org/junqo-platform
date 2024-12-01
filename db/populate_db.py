import requests

url = "http://127.0.0.1:4200/graphql"
headers = {
    "Content-Type": "application/json",
    "User-Agent": "HTTPie",
}

def send_request(user_number):
    query = {
        "query": f"""
        mutation {{
          createUser(createUserInput: {{email: "user{user_number}@mail.com", name: "user{user_number}"}}) {{
            name
          }}
        }}
        """
    }
    response = requests.post(url, json=query, headers=headers)
    if response.ok:
        print(f"User {user_number} created successfully: {response.json()}")
    else:
        print(f"Failed to create user {user_number}: {response.status_code}, {response.text}")

def main():
    for user_number in range(1, 150):  # Change range as needed
        send_request(user_number)

if __name__ == "__main__":
    main()
