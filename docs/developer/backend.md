---
title: Backend
nav_order: 2
---

<!-- omit in toc -->
# Backend

<!-- omit in toc -->
## Table of contents

- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
  - [Basic Usage](#basic-usage)
- [Technologies](#technologies)

## Getting started

The backend of the **Junqo-platform** is a NestJs application.  
Its main goal is to provide a GraphQL API that enables efficient and flexible database interactions.

### Prerequisites

Before you begin, ensure you have the following software installed:

- [Node.js](https://nodejs.org/) (version 14.x or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [PostgreSQL](https://www.postgresql.org/)

### Installation

1. Clone the repository:

  ```bash
  git clone https://github.com/Junqo-org/junqo-platform.git
  cd junqo-platform
  ```

2. Navigate to the backend directory:

  ```bash
  cd junqo_back
  ```

3. Install the dependencies:

  ```bash
  npm install
  ```

### Configuration

1. Create a `.env` file in the backend directory and add the following environment variables:

  ```env
  DATABASE_HOST=localhost
  DATABASE_PORT=5432
  DATABASE_USER=your_db_user
  DATABASE_PASSWORD=your_db_password
  DATABASE_NAME=your_db_name
  ```

2. Ensure PostgreSQL is running and the database is set up with the provided credentials.

### Running the Application

- To start the application in development mode:

  ```bash
  npm run start:dev
  ```

- To start the application in production mode:

  ```bash
  npm run start:prod
  ```

### Basic Usage

Once the application is running, you can access the API at `http://localhost:3000/graphql`. For detailed API documentation, refer to the [API documentation](http://doc.junqo.fr/api/introduction).

## Technologies

- [NestJs](https://nestjs.com/)
  - It is a progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- [PostgreSQL](https://www.postgresql.org/)
  - It is a powerful, open-source object-relational database system.
- [Sequelize](https://sequelize.org/)
  - It is a promise-based Node.js ORM for Postgres, MySQL, MariaDB, SQLite, and Microsoft SQL Server.
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
  - It is a community-maintained open-source GraphQL server that works with many Node.js HTTP server frameworks.
