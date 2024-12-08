import requests
import os

url = os.getenv("GRAPHQL_URL", "http://127.0.0.1:4200/graphql")
headers = {
    "Content-Type": "application/json",
    "User-Agent": os.getenv("USER_AGENT", "HTTPie"),
    "Authorization": os.getenv("API_KEY", ""),
}

def send_request(user_number):
    if not isinstance(user_number, int) or user_number < 1:
        raise ValueError("User number must be a positive integer")

    query = {
        "query": f"""
        mutation {{
          createUser(createUserInput: {{email: "user{user_number}@mail.com", name: "user{user_number}"}}) {{
            name
            email
            id
          }}
        }}
        """
    }
    try:
        response = requests.post(url, json=query, headers=headers)
        response.raise_for_status()
        data = response.json()

        if "errors" in data:
            print(f"GraphQL Error for user {user_number}: {data['errors']}")
            return False

        if "data" in data and data["data"]["createUser"]:
            print(f"User {user_number} created successfully: {data['data']['createUser']}")
            return True

        print(f"Unexpected response for user {user_number}: {data}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"Request failed for user {user_number}: {str(e)}")
        return False
    else:
        print(f"Failed to create user {user_number}: {response.status_code}, {response.text}")

def main():
    for user_number in range(1, 150):  # Change range as needed
        send_request(user_number)

if __name__ == "__main__":
    main()
