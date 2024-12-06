import schemathesis
from hypothesis import strategies as st
from hypothesis.stateful import initialize
from schemathesis.graphql import nodes
import json
import random
import re

# Load the schema from a file
schema = schemathesis.graphql.from_path("./schemas/schema.graphql")

# Set custom scalars
schemathesis.graphql.scalar("Date", st.dates().map(nodes.String))
schemathesis.graphql.scalar("DateTime", st.datetimes().map(nodes.String))
schemathesis.graphql.scalar("Email", st.emails().map(nodes.String))
schemathesis.graphql.scalar("ID", st.uuids().map(nodes.String))

def extract_uuids_from_sql(file_path):
    """
    Extracts all UUIDs from an SQL file.

    Args:
        file_path (str): The path to the SQL file.

    Returns:
        list: A list of extracted UUIDs.
    """
    # Regular expression to match UUIDs
    uuid_pattern = re.compile(r"\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b", re.IGNORECASE)

    # Read the SQL content from the file
    with open(file_path, "r") as file:
        sql_content = file.read()

    # Find all UUIDs
    return uuid_pattern.findall(sql_content)

# Example usage
sql_file_path = "db/test_data.sql"
uuids = extract_uuids_from_sql(sql_file_path)
random.seed()

from threading import Lock
from collections import OrderedDict

class ThreadSafeSet:
    def __init__(self):
        self._data = OrderedDict()
        self._lock = Lock()

    def add(self, item):
        with self._lock:
            self._data[item] = None

    def remove(self, item):
        with self._lock:
            self._data.pop(item, None)

    def __contains__(self, item):
        with self._lock:
            return item in self._data

    def __iter__(self):
        with self._lock:
            return iter(self._data.keys())

    def first(self):
        with self._lock:
            return next(iter(self._data.keys()), None)

    def pop(self):
        with self._lock:
            return self._data.popitem()[0]

users_name = ThreadSafeSet()
users_email = ThreadSafeSet()

@schemathesis.hook
def filter_body(context, body):
    try:
        if not body.definitions or not body.definitions[0].selection_set.selections:
            return True

        node = body.definitions[0].selection_set.selections[0]
        if node.name.value == "createUser":
            for argument in node.arguments:
                if argument.name.value == "createUserInput":
                    for field in argument.value.fields:
                        if field.name.value == "name":
                            name = field.value.value
                            name = name.strip()
                            if name == "":
                                return False
                            users_name.add(name)
                            continue
                        if field.name.value == "email":
                            email = field.value.value
                            email = email.lower()
                            email = re.sub(r'\s+', '', email)
                            if email == "":
                                return False
                            if email in users_email:
                                return False
                            users_email.add(email)
                            continue
        if node.name.value == "updateUser":
            for argument in node.arguments:
                if argument.name.value == "updateUserInput":
                    for field in argument.value.fields:
                        if field.name.value == "name":
                            name = field.value.value
                            name = name.strip()
                            if name == "" or name is None:
                                return False
                            users_name.add(name)
                            continue
                        if field.name.value == "email":
                            email = field.value.value
                            email = email.lower()
                            email = re.sub(r'\s+', '', email)
                            if email == "":
                                return False
                            if email in users_email:
                                return False
                            users_email.add(email)
                            continue
        return True
    except AttributeError as e:
        # Log error if needed
        return True  # Allow other hooks to process the query


@schemathesis.hook
def map_body(context, body):
    try:
        if not body.definitions or not body.definitions[0].selection_set.selections:
            return body

        node = body.definitions[0].selection_set.selections[0]
        if node.name.value == "user":
            for argument in node.arguments:
                if argument.name.value == "id":
                    random.seed()
                    argument.value.value = random.choice(uuids)
        if node.name.value == "updateUser":
            for argument in node.arguments:
                if argument.name.value == "id":
                    random.seed()
                    argument.value.value = random.choice(uuids)
        if node.name.value == "deleteUser":
            for argument in node.arguments:
                if argument.name.value == "id":
                    argument.value.value = uuids.pop()
        return body
    except AttributeError as e:
        # Log error if needed
        return body


# Stateful hook
# BaseAPIWorkflow = schema.as_state_machine()


# class APIWorkflow(BaseAPIWorkflow):
#     @initialize(
#         target=BaseAPIWorkflow.bundles["/users/"]["POST"],
#         case=schema["/users/"]["POST"].as_strategy(),
#     )
#     def init_user(self, case):
#         return self.step(case)
