# Environment Configuration

## Available Environment Variables

Create a `.env` file at the root of `junqo_front/` to configure the backend API.

### Local Mode (Default Development)

**Do NOT create a `.env` file** or leave `API_URL` empty:

```env
# .env (or no file at all)
# API_URL=
```

➡️ The Vite proxy will automatically redirect to `http://localhost:4200`

### Remote Server Mode (Dev/Staging)

Create a `.env` file with:

```env
# .env
API_URL=http://dev.junqo.fr:4200/api/v1
```

➡️ The Vite proxy will redirect to the remote server

### Production Mode

```env
# .env.production
API_URL=https://api.junqo.fr/api/v1
```

## WebSocket (Optional)

By default, the WebSocket URL is derived from `API_URL`. 
You can specify it manually if needed:

```env
WS_URL=http://localhost:4200
```

## Examples

### Local Development

```bash
# No .env file needed
npm run dev
# Output: 🔧 Vite proxy configured to: http://localhost:4200
```

### With Remote Server

```bash
# Create .env with:
echo "API_URL=http://dev.junqo.fr:4200/api/v1" > .env
npm run dev
# Output: 🔧 Vite proxy configured to: http://dev.junqo.fr:4200
```

## Restart Required

After modifying the `.env` file, **restart the development server**:

```bash
# Ctrl+C to stop
npm run dev
```
