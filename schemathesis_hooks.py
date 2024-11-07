import schemathesis
from hypothesis import strategies as st
from hypothesis.stateful import initialize
from schemathesis.graphql import nodes

# Load the schema from a file
schema = schemathesis.graphql.from_path("./schemas/schema.graphql")

# Set custom scalars
schemathesis.graphql.scalar("Date", st.dates().map(nodes.String))
schemathesis.graphql.scalar("DateTime", st.datetimes().map(nodes.String))
schemathesis.graphql.scalar("Email", st.emails().map(nodes.String))
schemathesis.graphql.scalar("ID", st.uuids().map(nodes.String))

users_name = []

@schemathesis.hook
def filter_body(context, body):
    node = body.definitions[0].selection_set.selections[0]
    if node.name.value == "createUser":
        for argument in node.arguments:
            if argument.name.value == "createUserInput":
                for field in argument.value.fields:
                    if field.name.value == "name":
                        if (field.value.value == "" or field.value.value in users_name):
                            return False
                        return True
        users_name.append(field.value.value)
    return True


# Stateful hook
# BaseAPIWorkflow = schema.as_state_machine()


# class APIWorkflow(BaseAPIWorkflow):
#     @initialize(
#         target=BaseAPIWorkflow.bundles["/users/"]["POST"],
#         case=schema["/users/"]["POST"].as_strategy(),
#     )
#     def init_user(self, case):
#         return self.step(case)
