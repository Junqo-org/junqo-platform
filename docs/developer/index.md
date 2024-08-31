<!-- omit in toc -->
# Developer documentation

Welcome to the developer documentation of the **Junqo-platform**.  
This documentation is intended for developers who want to contribute to the project.  
  
If you are a new contributor, you should start by reading the [getting started](#getting-started) section.  
If you need some precise information, see the following sections :  

<!-- omit in toc -->
## Table of contents

- [Getting started](#getting-started)
  - [Before you begin](#before-you-begin)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
- [Learn more](#learn-more)
  - [Project structure](#project-structure)
  - [Interactions](#interactions)
  - [Networking](#networking)
  - [Technologies](#technologies)

## Getting started

### Before you begin

Before you begin, you should have a basic understanding of the following:

- Take a look at the [contributing guidelines](../../CONTRIBUTING.md) to understand how to contribute to the project.
- Take a look at the [code of conduct](../../CODE_OF_CONDUCT.md) to understand how to behave in the project.
- Take a look at the [project structure](#project-structure) to understand how the project is organized.

### Prerequisites

- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) (v20.10.7 or higher)
- [Docker Compose](https://docs.docker.com/compose/) (v1.29.2 or higher)

### Installation

1. Clone the repository

    ```bash
    git clone git@github.com:Junqo-org/junqo-platform.git
    ```

2. Move to the project directory

    ```bash
    cd junqo-platform
    ```

3. Deploy the project locally using Docker Compose

    ```bash
    docker-compose up --build
    ```

### Usage

Notice, the following instructions are admitting that you are using the default configuration of the project.  
Furthermore, the project is running in production mode.  
You should replace *localhost* by the IP address of the machine running the project.  

- Access the web server at [http://localhost:80](http://localhost:80) or [https://localhost:443](https://localhost:443) if using TLS.
- Access the back server at [http://localhost:4200](http://localhost:4200).
- Access the database adminer at [http://localhost:3000](http://localhost:3000).

## Learn more

Notice, the following sections are admitting that you are using the default configuration of the project.

### Project structure

The project is structured as follows:

```bash
docker-compose.yml
├── /junqo_back
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── /src
│       ├── main.ts
├── /junqo_front
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── /lib
│       ├── main.dart
├── /docs
│   ├── developer_documentation/
│   ├── user_documentation/
│   ├── index.md
├── docker-compose.yml
├── docker-compose.dev.yml
```

> Project structure diagram

- `back`: Runs the REST API server to communicate with the database.
- `front`: Runs the web server / Flutter app seen by the user.
- `docs`: Contains the documentation of the project.
- `docker-compose.yml`: The main file to deploy the project in production mode.
- `docker-compose.dev.yml`: The main file to deploy the project in development mode.

### Interactions

The following diagram shows the interactions between the different parts of the project:  

```txt
   +-----------+       +----------+       +------------+
   |   Front   | <---> |   Back   | <---> |  DataBase  |
   +-----------+       +----------+       +------------+
```

> Interactions diagram

The **front** communicates with the back using the REST API.  
The **back** communicates with the database using the database driver.  
The **database** stores the data.  

### Networking

The following diagram shows the networking of the project:  

```txt
External ports:   80/443              4200                5432                 3000
                     |                  |                   |                    |
               +-----------+       +----------+       +------------+       +-----------+
               |   Front   |       |   Back   |       |  DataBase  |       |  Adminer  |
               +-----------+       +----------+       +------------+       +-----------+
```

> Networking diagram

The **front** is accessible on the World Wide Web at port **80**/**443**.
The **back** is accessible on the World Wide Web at port **4200**.
The **database** is accessible on the World Wide Web at port **5432** (admitting that you are using Postgresql).
The **adminer** is accessible on the World Wide Web at port **3000**.

### Technologies

The project uses the following technologies:

- [GitHub](https://github.com)
- [GitHub Pages](https://pages.github.com)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Swagger](https://swagger.io/)
- [Markdown](https://daringfireball.net/projects/markdown)
- [NestJs](https://nestjs.com/)
- [NodeJs](https://nodejs.org/en/)
- [PostgreSQL](https://www.postgresql.org/)
- [Sequelize](https://sequelize.org/)
- [Flutter](https://flutter.dev/)
- [MochaJs](https://mochajs.org/)
- [Prometheus](https://prometheus.io/docs/introduction/overview/)
- [Grafana](https://grafana.com/docs/grafana/latest/getting-started/getting-started-prometheus/)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Docker Swarm](https://docs.docker.com/engine/swarm/)
- [Kubernetes](https://kubernetes.io/docs/home/)
- [Helm](https://helm.sh/)
