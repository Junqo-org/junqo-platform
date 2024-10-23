---
title: Developer documentation
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

The development deployment have few differences with the production deployment:

- The back server is running in development mode. And the watch flag is enabled.
- The front server is running in development mode. And the watch flag is enabled.
- The database volume is set to the `./database-volume` folder. Allowing you interact with the database files.
- The database adminer is deployed. Allowing you to access the database adminer at [http://localhost:3000](http://localhost:3000). (The port can be changed using the `ADMINER_PORT` environment variable)

#### Production deployment

To deploy the **Junqo-platform** in production mode, you can use the following command:

```bash
# Deploy using Docker Compose
docker-compose up
```

The production deployment have few differences with the development deployment:

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
- `BACK_PORT`: The port of the back server. Default value is `42000`.
- `DATABASE_SHM_SIZE`: The size of the shared memory for the database container. Default value is `256MB`.
- `DATABASE_USER`: The user of the database. Default value is `junqo`.
- `DATABASE_NAME`: The name of the database. Default value is `junqo`.
- `DATABASE_PASSWORD_FILE`: The path to the file containing the password of the database user. Default value is `./db_password.conf`.

The following are only available in development mode:

- `ADMINER_PORT`: The port of the database adminer. Default value is `3000`.
- `ADMINER_DESIGN`: The design of the database adminer. Default value is `pepa-linha-dark`.

#### Configuration Files

The **Junqo-platform** uses configuration files to store the configuration of the project.

The `nginx.conf` file of the junqo front contains the configuration of the Nginx server.
You can modify this file to fit your needs.

#### Secret Files

The **Junqo-platform** uses secret files to store sensitive information.
These files should not be committed to the repository.

The secret files are:

- `db_password.conf`: Contains the password for the database user. (The file path may defer depending on the environment variable `DATABASE_PASSWORD_FILE`)
