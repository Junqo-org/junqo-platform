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
  - [Building for Production](#building-for-production)
  - [Development Environment Configuration](#development-environment-configuration)
  - [Hot Module Replacement (HMR)](#hot-module-replacement-hmr)
  - [Common Development Commands](#common-development-commands)
- [Technologies](#technologies)

## Getting started

The frontend of the **Junqo-platform** is a React application built with Vite.  
Its main goal is to provide a user interface to interact with the backend.

### Prerequisites

- **Node.js**: Version 18 or higher. [Install Node.js](https://nodejs.org/)
- **npm**: Version 9 or higher (comes with Node.js)

### Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/Junqo-org/junqo-platform.git
    ```

2. Navigate to the project directory:

    ```sh
    cd junqo-platform
    ```

3. Navigate to the frontend directory:

    ```sh
    cd junqo_front
    ```

4. Install dependencies:

    ```sh
    npm install
    ```

### Configuration

The frontend uses environment variables to configure the backend API connection. Note: Vite only exposes variables prefixed with `VITE_` to the client.

#### Local Mode (Default Development)

**Do NOT create a `.env` file** or leave `VITE_API_URL` empty:

```env
# .env (or no file at all)
# VITE_API_URL=
```

➡️ The Vite proxy will automatically redirect to `http://localhost:4200`

#### Remote Server Mode (Dev/Staging)

Create a `.env` file at the root of `junqo_front/` with:

```env
# .env
VITE_API_URL=http://dev.junqo.fr:4200/api/v1
```

➡️ The Vite proxy will redirect to the remote server

#### Production Mode

```env
# .env.production
VITE_API_URL=https://api.junqo.fr/api/v1
```

#### WebSocket (Optional)

By default, the WebSocket URL is derived from `VITE_API_URL`. You can specify it manually if needed:

```env
VITE_WS_URL=http://localhost:4200
```

**Note:** After modifying the `.env` file, **restart the development server** (Ctrl+C then `npm run dev`).

For more details, see [ENV_CONFIG.md](./ENV_CONFIG.md).

### Local Development Setup

1. Ensure the backend is running (see [Backend Documentation](./backend.md))
2. Run the development server:

  ```sh
  npm run dev
  ```

3. Open your browser at `http://localhost:3000`

### Running the Application

- To run the application in development mode with hot reload:

  ```sh
  npm run dev
  ```

- To run with custom host/port:

  ```sh
  npm run dev -- --host 0.0.0.0 --port 8080
  ```

### Building for Production

- To build the application for production:

  ```sh
  npm run build
  ```

- To preview the production build locally:

  ```sh
  npm run preview
  ```

### Development Environment Configuration

- **VS Code**: Install the following extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
- **Browser DevTools**: Install React Developer Tools extension

### Hot Module Replacement (HMR)

Vite provides blazing-fast Hot Module Replacement (HMR) out of the box:

- **Automatic**: Changes to your code are instantly reflected in the browser without losing component state
- **Fast Refresh**: React components update without full page reload
- **No configuration needed**: Just save your files and see the changes

### Common Development Commands

- Clean build artifacts:

  ```sh
  rm -rf dist node_modules/.vite
  ```

- Update dependencies:

  ```sh
  npm update
  ```

- Check for outdated packages:

  ```sh
  npm outdated
  ```

- Run TypeScript type checking:

  ```sh
  npx tsc --noEmit
  ```

- Run linter:

  ```sh
  npm run lint
  ```

- Format code with Prettier:

  ```sh
  npm run format
  ```

- Analyze bundle size:

  ```sh
  npm run build -- --analyze
  ```

## Technologies

- [React](https://react.dev/)
  - A JavaScript library for building user interfaces with reusable components
- [TypeScript](https://www.typescriptlang.org/)
  - JavaScript with syntax for types, providing better developer experience and type safety
- [Vite](https://vitejs.dev/)
  - Next generation frontend tooling with blazing-fast dev server and optimized builds
- [React Router](https://reactrouter.com/)
  - Declarative routing for React applications
- [Axios](https://axios-http.com/)
  - Promise-based HTTP client for making API requests
- [Zustand](https://github.com/pmndrs/zustand)
  - Small, fast, and scalable state management solution
- [Tailwind CSS](https://tailwindcss.com/)
  - Utility-first CSS framework for rapidly building custom designs
- [shadcn/ui](https://ui.shadcn.com/)
  - Re-usable components built with Radix UI and Tailwind CSS
- [Sonner](https://sonner.emilkowal.ski/)
  - Opinionated toast component for React
- [date-fns](https://date-fns.org/)
  - Modern JavaScript date utility library
