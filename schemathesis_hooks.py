from collections import OrderedDict
from threading import Lock
import schemathesis
from hypothesis import strategies as st
from schemathesis.graphql import nodes
import random
import re
import os
import logging


logger = logging.getLogger(__name__)

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
    Raises:
        FileNotFoundError: If the SQL file does not exist
        IOError: If there are issues reading the file
    """
    # Regular expression to match UUIDs
    uuid_pattern = re.compile(
        r"\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b", re.IGNORECASE)

    try:
        with open(file_path, "r") as file:
            sql_content = file.read()
    except FileNotFoundError:
        raise FileNotFoundError(f"SQL file not found: {file_path}")
    except IOError as e:
        raise IOError(f"Error reading SQL file: {e}")

    # Find all UUIDs
    return uuid_pattern.findall(sql_content)


# Example usage
sql_file_path = os.getenv('TEST_DATA_SQL_PATH', "db/test_data.sql")
uuids = extract_uuids_from_sql(sql_file_path)
random.seed()


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


def validate_user_fields(fields, is_update=False):
    """Validate user fields and update tracking sets."""
    for field in fields:
        if field.name.value == "name":
            name = field.value.value.strip()
            if not name or (is_update and name is None):
                return False
            users_name.add(name)
        elif field.name.value == "email":
            email = field.value.value.lower()
            email = re.sub(r'\s+', '', email)
            if not email or email in users_email:
                return False
            users_email.add(email)
    return True


@schemathesis.hook
def filter_body(context, body):
    try:
        if not body.definitions or not body.definitions[0].selection_set.selections:
            return True

        node = body.definitions[0].selection_set.selections[0]
        operation = node.name.value
        if operation in ("createUser", "updateUser"):
            for argument in node.arguments:
                input_type = f"{operation}Input"
                if argument.name.value == input_type:
                    return validate_user_fields(
                        argument.value.fields,
                        is_update=(operation == "updateUser")
                    )
        return True
    except AttributeError as e:
        logger.error("Schemathesis Hook Error in filter_body: %s", str(e))
        return True  # Allow other hooks to process the query

def set_random_uuid(argument):
    """Set a random UUID for the given argument."""
    argument.value.value = random.choice(uuids)


@schemathesis.hook
def map_body(context, body):
    try:
        if not body.definitions or not body.definitions[0].selection_set.selections:
            return body

        node = body.definitions[0].selection_set.selections[0]
        operation = node.name.value
        if operation in ("user", "updateUser"):
            for argument in node.arguments:
                if argument.name.value == "id":
                    set_random_uuid(argument)
        elif operation == "deleteUser":
            for argument in node.arguments:
                if argument.name.value == "id":
                    argument.value.value = uuids.pop()
        return body
    except AttributeError as e:
        logger.error("Schemathesis Hook Error in map_body: %s", str(e))
        return body
