---
title: CI/CD
---

<!-- omit in toc -->
# Continuous Integration and Continuous Deployment

Welcome to the CI/CD documentation of the **Junqo-platform**.  
This documentation is intended for developers who want to contribute to the project.

<!-- omit in toc -->
## Table of contents

- [Deployment](#deployment)
  - [Prerequisites](#prerequisites)
  - [Deploy using Docker Compose](#deploy-using-docker-compose)
    - [Development deployment](#development-deployment)
    - [Production deployment](#production-deployment)
  - [Configuration](#configuration)
    - [Environment Variables](#environment-variables)
    - [Configuration Files](#configuration-files)
    - [Secret Files](#secret-files)
- [Automatic tests](#automatic-tests)
  - [Run github action locally](#run-github-action-locally)
  - [Deployment tests](#deployment-tests)
  - [Api tests](#api-tests)
    - [Run locally](#run-locally)
  - [Front tests](#front-tests)
  - [Back tests](#back-tests)
- [Documentation Generation](#documentation-generation)
  - [Automatic documentation deployment](#automatic-documentation-deployment)
- [Mirroring](#mirroring)
  - [Why is the project mirrored](#why-is-the-project-mirrored)
  - [How is the project mirrored](#how-is-the-project-mirrored)

## Deployment

The deployment of the **Junqo-platform** is done using [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/).

### Prerequisites

To deploy the **Junqo-platform**, you need to have the following tools installed on your machine:

- [Docker](https://www.docker.com/) (v20.10.7 or higher)
- [Docker Compose](https://docs.docker.com/compose/) (v1.29.2 or higher)

If you don't have these tools installed, you can follow the installation instructions on the official websites of [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/).

Once you have installed these tools, you can proceed to the deployment of the **Junqo-platform**.

### Deploy using Docker Compose

The first step to deploy the **Junqo-platform** is to clone or download the repository and move to the project directory:

```bash
# Clone the repository
git clone git@github.com:Junqo-org/junqo-platform.git

# Move to the project directory
cd junqo-platform
```

Once you are in the project directory, you need to create a `db_password.conf` file at the root of the project.
This file should contain the password for the database user.
The content of the file should look like this:

```bash
my_db_password
```

After creating the `db_password.conf` file, you can proceed to deploy the **Junqo-platform** using Docker Compose.

#### Development deployment

To deploy the **Junqo-platform** in development mode, you can use the following command:

```bash
# Deploy using Docker Compose
docker compose -f docker-compose.dev.yaml up --watch

# You can use the --build flag to rebuild the images
docker compose -f docker-compose.dev.yaml up --build --watch
```

This command will deploy the **Junqo-platform** in development mode and watch for changes in the source code.
Allowing you to develop and test the application in real-time.
For more information on the watch flag, you can refer to the [Docker Compose documentation](https://docs.docker.com/compose/how-tos/file-watch/).

The development deployment has several differences from the production deployment:

- The back server is running in development mode. And the watch flag is enabled.
- The front server is running in development mode. And the watch flag is enabled.
- The database volume is set to the `./database-volume` folder, allowing you to interact with the database files.
- The database is initialized from the `./db/test_data.sql` file.
- The database adminer is deployed. Allowing you to access the database adminer at [http://localhost:3000](http://localhost:3000). (The port can be changed using the `ADMINER_PORT` environment variable)

#### Production deployment

To deploy the **Junqo-platform** in production mode, you can use the following command:

```bash
# Deploy using Docker Compose
docker-compose up
```

The production deployment has several differences from the development deployment:

- The back server is running in production mode.
- The front server is running in production mode.
- The database volume is set to the docker volume `db_data`.
- The database adminer is not deployed.

### Configuration

#### Environment Variables

The **Junqo-platform** uses environment variables to store the configuration of the project.

You can add a `.env` file at the root of the project to store the environment variables.
If an environment variable is not found, the default value will be used.

Here is the list of environment variables used by the **Junqo-platform**:

- `FLUTTER_VERSION`: The version of Flutter to use. Default value is `3.22.2`.
- `BACK_PORT`: The port of the back server. Default value is `4200`.
- `DATABASE_SHM_SIZE`: The size of the shared memory for the database container. Default value is `256MB`.
- `DATABASE_USER`: The user of the database. Default value is `junqo`.
- `DATABASE_NAME`: The name of the database. Default value is `junqo`.
- `DATABASE_PASSWORD_FILE`: The path to the file containing the password of the database user. Default value is `./db_password.conf`.

The following are only available in development mode:

- `ADMINER_PORT`: The port of the database adminer. Default value is `3000`.
- `ADMINER_DESIGN`: The design of the database adminer. Default value is `pepa-linha-dark`.
- `TEST_DATA_FOLDER`: The folder containing the test data for the database. The test should be a file ending with `.sql`. Default value is `./db`.

#### Configuration Files

The **Junqo-platform** uses configuration files to store the configuration of the project.

The `nginx.conf` file of the junqo front contains the configuration of the Nginx server.
You can modify this file to fit your needs.

#### Secret Files

The **Junqo-platform** uses secret files to store sensitive information.
These files should not be committed to the repository.

The secret files are:

- `db_password.conf`: Contains the password for the database user. (The file path may defer depending on the environment variable `DATABASE_PASSWORD_FILE`)

## Automatic tests

Automatic tests are run using the Github Actions pipeline.  
These are defined in the `.github/workflows` folder.  

### Run github action locally

You can use the [nektosact](https://nektosact.com/introduction.html) to run the tests locally.  
First, you need to install nektosact by following the [installation instructions](https://nektosact.com/installation/index.html).  
Then run the following command to execute specific workflow tests:  
Note: act requires root privileges to run Docker containers, hence the sudo requirement.  

```bash
# Run the tests specified in the <specific file>
sudo act workflow_dispatch -W '.github/workflows/<specific_file>'
# Example
sudo act workflow_dispatch -W '.github/workflows/deployment-tests.yml'
```

### Deployment tests

These tests are used to test the deployment of the **Junqo-platform** in development and production environments.

The deployment tests are run using the `deployment-tests.yml` workflow.  
The workflow is triggered when the following conditions are met:

- A pull request is opened.
- The pull request merges into the `main` or `dev` branch.
- The files inside the `junqo_front` or `junqo_back` folder are modified.

The workflow runs the following steps:

1. Test the development environment deployment.
2. Test the production environment deployment.

These tests are run using th `deployment-test-template.yml` workflow.  
The workflow runs the following steps:

1. Checkout the repository.
2. Start the docker compose services.
3. Check if the services are up and running.
4. Stop the docker compose services.

### Api tests

These tests are used to test the API of the **Junqo-platform** in an operational environment.

The API tests are run using the `api-tests.yml` workflow.  
The workflow is triggered when the following conditions are met:

- A pull request is opened.
- The pull request merges into the `main` or `dev` branch.
- The files inside the `junqo_back` folder are modified.

The workflow runs the following steps:

1. Checkout the repository.
2. Start the docker compose services.
3. Run API tests using [shemathesis](https://schemathesis.readthedocs.io/).
4. Stop the docker compose services.

#### Run locally

If you want to run the test locally, launch the project in development mode and launch the schemathesis container.

```bash
# Launch the project in dev mode
docker compose -f docker-compose.dev.yaml up

# Launch the schemathesis tests using container
docker run --network="junqo-platform_default" schemathesis/schemathesis:stable run  http://localhost:4200/graphql/
```

### Front tests

These tests are used to test the front-end of the **Junqo-platform**.

The front tests are run using the `front-tests.yml` workflow.
The workflow is triggered when the following conditions are met:

- A pull request is opened.
- The pull request merges into the `main` or `dev` branch.
- The files inside the `junqo_front` folder are modified.

The workflow runs the following steps:

1. Checkout the repository.
2. Install Flutter.
3. Install the dependencies.
4. Run the front tests using [flutter test](https://flutter.dev/docs/testing).

### Back tests

These tests are used to test the back-end of the **Junqo-platform**.

The back tests are run using the `back-tests.yml` workflow.
The workflow is triggered when the following conditions are met:

- A pull request is opened.
- The pull request merges into the `main` or `dev` branch.
- The files inside the `junqo_back` folder are modified.

The workflow runs the following steps:

1. Checkout the repository.
2. Install Node.js.
3. Install the dependencies.
4. Run the back tests using [jest](https://jestjs.io/).

## Documentation Generation

The project uses **Magidoc** to generate the backend API documentation.  
The documentation is available at [http://doc.junqo.fr/api/index.html](../api/index.html).  
The documentation is generated automatically when the project is deployed using Github Action.  

If you want to generate the documentation manually, you can use the following command:

```bash
npx @magidoc/cli@latest generate
```

The rest of the documentation is written in Markdown and is available in the [docs](../../docs) directory.
It is automatically generated into a static website using Jekyll and is deployed using Github Pages.

Install the dependencies by running the following command:

```bash
bundle install
```

Update the `Gemfile.lock` file by running the following command:

```bash
bundle update
```

To generate the documentation, run the following command:

```bash
bundle exec jekyll build
```

To serve the documentation locally, run the following command:

```bash
bundle exec jekyll serve --baseurl=""
```

For more information, see the [the official github page documentation](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/testing-your-github-pages-site-locally-with-jekyll#building-your-site-locally).

### Automatic documentation deployment

The automatic documentation deployment generate the documentation using the markdown files in the `docs` folder.  
Then it deploys the documentation at [http://doc.junqo.fr](http://doc.junqo.fr) using Github Pages. 

The documentation deployment is done using the `deploy-documentation.yml` workflow.  
The workflow is triggered when the following conditions are met:

- A push is made to the `main` branch.
- The files inside the `docs` folder are modified.
- The `deploy-documentation.yml` file is modified.

The workflow runs the following steps:

1. Checkout the repository.
2. Install Node.js.
3. Generate de API documentation using [Magidoc](https://magidoc.js.org/introduction/welcome).
4. Upload the API documentation artifacts.

Then in a different job:

1. Checkout the repository.
2. Install Ruby.
3. Setup Github Pages.
4. Fetch the API documentation.
5. Upload the final documentation artifacts.

Finally in a different job:

1. Fetch the final documentation artifacts.
2. Deploy the documentation to Github Pages.

## Mirroring

As the project is evaluated by the [EPITECH](https://www.epitech.eu/) school, the project is mirrored to a private evaluation repository.

### Why is the project mirrored

The project is mirrored to allow the EPITECH school to evaluate the project.  
It is developed on the [Junqo-org](https://github.com/Junqo-org) as an open-source project.  
We chose to create an open-source project to allow the community to contribute to the project.  
Furthermore it allows the project to be more transparent and to be evaluated by the community.  
We can also take advantage of the many advantageous plans offered by some organizations to open-source projects.  
These organizations includes:

- [Github](https://github.com/)
- [CodeRabbit](https://www.coderabbit.ai/)
- [Schemathesis](https://schemathesis.readthedocs.io/)

### How is the project mirrored

The mirroring is done using the Github Actions pipeline.  
The workflow is triggered when a **push** or **delete** event is triggered.  
The workflow configuration can be found in the `.github/workflows/eip-mirroring.yml` file.  
