---
title: Frontend
nav_order: 2
---

<!-- omit in toc -->
# Frontend

<!-- omit in toc -->
## Table of contents

- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Local Development Setup](#local-development-setup)
  - [Running the Application](#running-the-application)
- [Technologies](#technologies)

## Getting started

The frontend of the **Junqo-platform** is a Flutter application.  
Its main goal is to provide a user interface to interact with the backend.

### Prerequisites

- **Flutter**: Version 3.22.2 or higher. [Install Flutter](https://docs.flutter.dev/get-started/install)
- **Dart**: Comes with Flutter, but ensure it's up to date.
- **GraphQL CLI**: For managing GraphQL documents. [Install GraphQL CLI](https://www.npmjs.com/package/graphql-cli)

### Installation

1. Clone the repository:

  ```sh
  git clone https://github.com/your-repo/junqo-platform.git
  ```

2. Navigate to the frontend directory:

  ```sh
  cd junqo-platform/junqo_front
  ```

3. Get the Flutter dependencies:

  ```sh
  flutter pub get
  ```

### Local Development Setup

1. Ensure you have an emulator or a physical device connected.
2. Run the application:

  ```sh
  flutter run
  ```

### Running the Application

- To run the application in debug mode:

  ```sh
  flutter run
  ```

- To build the application for release:

  ```sh
  flutter build apk
  ```

## Technologies

- [Flutter](https://flutter.dev/)
  - It is an open source framework for building beautiful, natively compiled, multi-platform applications from a single codebase.
- [Ferry Graphql](https://ferrygraphql.com/)
  - It is a simple, powerful GraphQL Client for Flutter and Dart.
