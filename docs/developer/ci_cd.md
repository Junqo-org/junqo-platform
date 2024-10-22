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
    - [Docker Compose File](#docker-compose-file)
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
- The database has no volume. So, the data will be lost when the container is stopped.
- The database adminer is deployed. Allowing you to access the database adminer at [http://localhost:3000](http://localhost:3000).

#### Production deployment

To deploy the **Junqo-platform** in production mode, you can use the following command:

```bash
# Deploy using Docker Compose
docker-compose up
```

The production deployment have few differences with the development deployment:

- The back server is running in production mode.
- The front server is running in production mode.
- The database has a volume. So, the data will be persisted when the container is stopped.
- The database adminer is not deployed.

### Configuration

#### Docker Compose File

The deployment of the **Junqo-platform** is done using the `docker-compose.yaml` and `docker-compose.dev.yaml` files.
You can modify these to fit your needs.

The `dockerfile.yaml` file of the junqo front accepts the following arguments:

- `FLUTTER_VERSION`: The version of the Flutter SDK to use.

#### Configuration Files

The **Junqo-platform** uses configuration files to store the configuration of the project.

The `nginx.conf` file of the junqo front contains the configuration of the Nginx server.
You can modify this file to fit your needs.

#### Secret Files

The **Junqo-platform** uses secret files to store sensitive information.
These files should not be committed to the repository.

The secret files are:

- `db_password.conf`: Contains the password for the database user.
