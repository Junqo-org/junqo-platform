<!-- omit in toc -->
# junqo_front

The mobile and web application for Junqo.

<!-- omit in toc -->
## Table of Contents

- [Getting Started](#getting-started)
- [Setup](#setup)
- [Run](#run)
  - [Development Mode](#development-mode)
  - [Platform-Specific Commands](#platform-specific-commands)
  - [Release Mode](#release-mode)

## Getting Started

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.

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
