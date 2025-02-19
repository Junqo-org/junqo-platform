<!-- omit in toc -->
# junqo_front

The mobile and web application for Junqo.

<!-- omit in toc -->
## Table of Contents

- [Getting Started](#getting-started)
  - [Project Overview](#project-overview)
  - [Prerequisites](#prerequisites)
  - [Additional Resources](#additional-resources)
- [Setup](#setup)
- [Run](#run)
  - [Development Mode](#development-mode)
  - [Platform-Specific Commands](#platform-specific-commands)
  - [Release Mode](#release-mode)

## Getting Started

Welcome to the Junqo project! This section will help you get started with the development environment and provide an overview of the project's architecture.

### Project Overview

Junqo is a mobile and web application built using Flutter. The project follows a modular architecture to separate concerns and improve maintainability. Key components include:

- **UI Layer**: Built with Flutter widgets.
- **State Management**: Managed using Provider.
- **Networking**: Handled by GraphQL and REST APIs.
- **Local Storage**: Implemented using Hive.

### Prerequisites

Before you begin, ensure you have the following tools installed:

- **Flutter**: Version 3.22.2 or higher. [Install Flutter](https://docs.flutter.dev/get-started/install)
- **Dart**: Comes with Flutter, but ensure it's up to date.
- **GraphQL CLI**: For managing GraphQL documents. [Install GraphQL CLI](https://www.npmjs.com/package/graphql-cli)

### Additional Resources

For more detailed information about the Junqo project, refer to our [project documentation](http://doc.junqo.fr/developer/).

For help getting started with Flutter development, view the [online documentation](https://docs.flutter.dev/), which offers tutorials, samples, guidance on mobile development, and a full API reference.

## Setup

Get dependencies

```sh
flutter pub get
```

Build graphql documents

```sh
dart run build_runner build
```

## Run

### Development Mode

Run the application in debug mode:

```sh
flutter run
```

### Platform-Specific Commands

Run for web:

```sh
flutter run -d chrome
```

Run for specific mobile device:

```sh
flutter devices                    # List available devices
flutter run -d <device-id>         # Run on specific device
```

### Release Mode

Build and run in release mode:

```sh
flutter run --release
```
