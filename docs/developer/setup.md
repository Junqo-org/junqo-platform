---
title: Setup
nav_order: 1
---

<!-- omit in toc -->
# Setup

## Installation

### Using Docker Compose

To deploy the **Junqo-platform**, you need to have the following tools installed on your machine:

- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) (v20.10.7 or higher)
- [Docker Compose](https://docs.docker.com/compose/) (v1.29.2 or higher)
- [Python](https://www.python.org/) (v3.6 or higher)

If you don't have these tools installed, you can follow the installation instructions on the official websites of [Git](https://git-scm.com/), [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/), and [Python](https://www.python.org/).

Once you have installed these tools, you can proceed to the deployment of the **Junqo-platform**.

1. The first step to deploy the **Junqo-platform** is to clone or download the repository and move to the project directory:

    ```bash
    # Clone the repository
    git clone git@github.com:Junqo-org/junqo-platform.git

    # Move to the project directory
    cd junqo-platform
    ```

2. After cloning the repository, you need to spread the graphql schema to the frontend and the backend.

    ```bash
    python3 tools/update_schemas.py
    ```

3. Once you are in the project directory, you need to create a `db_password.conf` file at the root of the project.
    This file should contain the password for the database user.
    The content of the file should look like this:

    ```bash
    my_db_password
    ```

4. Then, you need to create the `junqo_back/.env` file to configure the backend.
    You can use the `junqo_back/exemple.env` file to create the new one.
    Don't forget to change the values as they are not safe for production use.

    For more informations, see the [backend configuration documentation](./backend.md#configuration).

5. Then, you need to create the `junqo_front/.env` file to configure the frontend.
    You can use the `junqo_front/exemple.env` file to create the new one.
    Don't forget to change the values as they are not safe for production use.

    For more informations, see the [frontend configuration documentation](./frontend.md#configuration).

6. After creating the `db_password.conf`, the `junqo_back/.env` and the `junqo_front/.env` files, you can proceed to deploy the **Junqo-platform** using Docker Compose.

    ```bash
    docker-compose up -d
    ```

    For more informations, see the [deployment documentation](./deployment.md).

### Building the project

#### Backend

To build the backend, follow the following documentation: [backend documentation](./backend.md#installation).

#### Frontend

To build the frontend, follow the following documentation: [frontend documentation](./frontend.md#installation).

#### Database

1. Install PostgreSQL

    Windows:
    Download the PostgreSQL installer from the official website.
    Run the installer and follow the on-screen instructions.

    Linux (Ubuntu/Debian):

    ```bash
    sudo apt update
    sudo apt install postgresql postgresql-contrib
    ```

    macOS:
    Use Homebrew to install PostgreSQL:

    ```bash
    brew update
    brew install postgresql
    ```

2. Start the PostgreSQL Service

    Windows:
    The installer usually sets PostgreSQL to start automatically.

    Linux:

    ```bash
    sudo service postgresql start
    ```

    macOS:

    ```bash
    brew services start postgresql
    ```

3. Access PostgreSQL

    Switch to the postgres user:

    ```bash
    sudo -i -u postgres
    ```

    Access the PostgreSQL prompt:

    ```bash
    psql
    ```

4. Create a New Database

    In the PostgreSQL prompt, create a new database:

    ```sql
    CREATE DATABASE mydatabase;
    ```

5. Create a New User

    Create a new user with a password:

    ```sql
    CREATE USER myuser WITH ENCRYPTED PASSWORD 'mypassword';
    ```

6. Grant Privileges

    Grant all privileges on the new database to the new user:

    ```sql
    GRANT ALL PRIVILEGES ON DATABASE mydatabase TO myuser;
    ```

7. Configure PostgreSQL

    Edit the postgresql.conf file to configure settings like listening addresses, ports, etc.
    Edit the pg_hba.conf file to configure client authentication.

8. Restart PostgreSQL

    After making configuration changes, restart the PostgreSQL service:
    Linux:

    ```bash
    sudo service postgresql restart
    ```

    macOS:

    ```bash
    brew services restart postgresql
    ```
