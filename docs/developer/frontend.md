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
  - [Configuration](#configuration)
  - [Local Development Setup](#local-development-setup)
  - [Running the Application](#running-the-application)
  - [Development Environment Configuration](#development-environment-configuration)
  - [Hot Reload/Restart](#hot-reloadrestart)
  - [Common Development Commands](#common-development-commands)
  - [Platform-Specific Build Instructions](#platform-specific-build-instructions)
- [Technologies](#technologies)

## Getting started

The frontend of the **Junqo-platform** is a Flutter application.  
Its main goal is to provide a user interface to interact with the backend.

### Prerequisites

- **Flutter**: Version 3.22.2 or higher. [Install Flutter](https://docs.flutter.dev/get-started/install)
- **Dart**: Comes with Flutter, but ensure it's up to date.
- **GraphQL CLI**: For managing GraphQL documents. [Install GraphQL CLI](https://www.npmjs.com/package/graphql-cli)
- **Python 3**: For updating the GraphQL schemas. [Install Python 3](https://www.python.org/downloads/)

### Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/Junqo-org/junqo-platform.git
    ```

2. Navigate to the project directory:

    ```sh
    cd junqo-platform
    ```

3. Update the schemas:

    ```sh
    python3 tools/update_schemas.py
    ```

4. Navigate to the frontend directory:

    ```sh
    cd junqo_front
    ```

5. Get the Flutter dependencies:

    ```sh
    flutter pub get
    ```

### Configuration

To configure the frontend, you can use flutter build environment variables when building the app or `.env` files in the `junqo_front` directory.
If an environment variable is not found, the default value will be used.

Here is the list of environment variables used by the **frontend**:

- `API_URL`: The URL of the backend API. Default: `http://localhost:4200/graphql`

Create a `.env` file in the frontend directory and add the following environment variables:

```env
# Url of the junqo-platform backend
API_URL=http://localhost:4200/graphql
```

If you want to use the flutter build environment variables, you can use the following command:

```sh
flutter run --dart-define=API_URL=http://localhost:4200/graphql
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

### Development Environment Configuration

- **VS Code**: Install the Flutter and Dart extensions.
- **Android Studio**: Install the Flutter and Dart plugins.

### Hot Reload/Restart

- **Hot Reload**: Press `r` in the terminal or use the hot reload button in your IDE.
- **Hot Restart**: Press `R` in the terminal or use the hot restart button in your IDE.

### Common Development Commands

- Clean the project:

  ```sh
  flutter clean
  ```

- Upgrade dependencies:

  ```sh
  flutter pub upgrade
  ```

- Upgrade dependencies versions:

  ```sh
  flutter pub outdated
  flutter pub upgrade --major-versions
  ```

- Run tests:

  ```sh
  flutter test
  ```

- Run lint checks:

  ```sh
  flutter analyze
  ```

- Generate GraphQL code:

  ```sh
  flutter pub run build_runner build
  ```

### Platform-Specific Build Instructions

- **iOS**: Ensure you have Xcode installed. Run:

  ```sh
  flutter build ios
  ```

- **Web**: Ensure you have Chrome installed. Run:

  ```sh
  flutter build web
  ```

- **Desktop**: Ensure you have the necessary dependencies installed. Run:

  ```sh
  flutter build windows
  flutter build macos
  flutter build linux
  ```

## Technologies

- [Flutter](https://flutter.dev/)
  - It is an open source framework for building beautiful, natively compiled, multi-platform applications from a single codebase.
- [Ferry Graphql](https://ferrygraphql.com/)
  - It is a simple, powerful GraphQL Client for Flutter and Dart.
