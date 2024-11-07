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

@schemathesis.hook
def filter_query(context, query):
    print("query : ", query)
    # Simple filtering to avoid a specific query parameter value
    return True


@schemathesis.hook
def flatmap_body(context, body):
    print("body : ", body)
    return body

@schemathesis.hook
def before_generate_query(context, strategy):
    print("strategy : ", strategy)
    return strategy

# Stateful hook
# BaseAPIWorkflow = schema.as_state_machine()


# class APIWorkflow(BaseAPIWorkflow):
#     @initialize(
#         target=BaseAPIWorkflow.bundles["/users/"]["POST"],
#         case=schema["/users/"]["POST"].as_strategy(),
#     )
#     def init_user(self, case):
#         return self.step(case)


# @schema.hook
# def flatmap_body(context, body):
#     node = body.definitions[0].selection_set.selections[0]
#     if node.name.value == "user":
#         return st.just(body).map(lambda b: modify_body(b, "id"))
#     return body


# def modify_body(body, new_field_name):
#     # Create a new field
#     new_field = ...  # Create a new field node
#     new_field.name.value = new_field_name

#     # Add the new field to the query
#     body.definitions[0].selection_set.selections.append(new_field)

#     return body
