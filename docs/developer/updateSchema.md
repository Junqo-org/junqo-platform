---
title: How to update the graphql schema
nav_order: 2
---

# How to update graphql schemas

The GraphQL schemas are defined in the `schemas/*.graphql` files.  
To update the schemas, you need to modify the `schemas/*.graphql` files and then generate the schemas.  

## Generate the schemas for the frontend

To generate the schemas for the frontend, you need to run the following commands from the root of the project:  

```bash
cp schemas/*.graphql junqo_front/lib/graphql/;
cd junqo_front;
dart run build_runner build
```

First, you copy the `schemas/*.graphql` files to the `junqo_front/lib/graphql/` directory.  
Then, you go to the `junqo_front` directory and run the `flutter pub run build_runner build` command to generate the corresponding `.dart` files.  

If you have created a new schema file, you need to add it to the `build.yaml` file in the `junqo_front` directory.  
For more information, see the [ferrygraphql documentation](https://ferrygraphql.com/docs/codegen#multiple-schemas).

```yaml
targets:
  $default:
    builders:
      ferry_generator|graphql_builder:
        enabled: true
        options:
          schemas:
            - junqo_front|lib/graphql/schema.graphql
            # Add your schema file here
      ferry_generator|serializer_builder:
        enabled: true
        options:
          schemas:
            - junqo_front|lib/graphql/schema.graphql
            # Add your schema file here
```

## Generate the schemas for the backend

The schemas are automatically retrieved and generated from the `schemas/*.graphql` files when the project is built.