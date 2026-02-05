# 🚀 Quick Start Guide - Junqo Platform

## Prerequisites

- Node.js 18+ and npm
- Backend running on `http://dev.junqo.fr:4200` or update `.env`

## Installation

```bash
cd junqo_front
npm install
```

## Development

### Option 1: Local Development (with Vite Proxy)
```bash
npm run dev
```
This uses the Vite proxy to avoid CORS issues. The proxy is configured in `vite.config.ts`.

### Option 2: Remote Backend
```bash
npm run dev:remote
```
This connects directly to `http://dev.junqo.fr:4200` with explicit environment variables.

### Access the App
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Build

```bash
npm run build
npm run preview
```

## Docker

### Development
```bash
docker build -f dockerfile.dev -t junqo-front-dev .
docker run -p 3000:3000 junqo-front-dev
```

### Production
```bash
docker build -f dockerfile.prod -t junqo-front-prod .
docker run -p 80:80 junqo-front-prod
```

## Environment Variables

Create a `.env` file (optional, as defaults are set):

```env
VITE_API_URL=http://dev.junqo.fr:4200/api/v1
```

## Features Overview

### 🔐 Authentication
1. Visit `/welcome`
2. Click "S'inscrire" (Register)
3. Choose user type: Student, Company, or School
4. Fill in your details and create an account
5. You're automatically logged in!

### 💼 For Students

#### Browse Offers
- Go to `/offers`
- Use filters: contract type, location
- Search by keywords
- Click on an offer to see details

#### Apply to Offers
- Open an offer
- Click "Postuler" (Apply)
- Track your applications in "My Applications"

#### CV Analysis
- Go to `/cv`
- Upload your CV (PDF)
- Optionally specify a job context
- Click "Analyser mon CV"
- Get AI-powered recommendations!

#### Interview Practice
- Go to `/interview`
- Choose interview type:
  - Technical
  - Behavioral
  - Case Study
  - General
- Start practicing with AI interviewer
- Get real-time feedback!

### 🏢 For Companies

#### Create Offers
- Go to `/offers`
- Click "Créer une offre"
- Fill in:
  - Title & description
  - Contract type (Internship, CDI, etc.)
  - Location type (Remote, Hybrid, On-site)
  - Salary & duration
  - Required skills
  - Benefits
  - Education level
- Click "Créer l'offre"

#### Manage Applications
- View applications in "My Applications"
- Update application status:
  - Not Opened
  - Opened
  - Accepted
  - Refused

### 💬 Messaging (WebSocket)
- Real-time chat with other users
- Typing indicators
- Online/offline status
- Read receipts
- Message history

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Components
- **Zustand** - State management
- **React Router** - Routing
- **Axios** - API calls
- **Socket.IO** - WebSocket
- **Framer Motion** - Animations
- **React Hook Form** - Forms
- **Zod** - Validation
- **pdfjs-dist** - PDF extraction

## Project Structure

```
junqo_front/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   └── layout/          # Layout components (Header, etc.)
│   ├── pages/               # All page components
│   ├── services/
│   │   ├── api.ts           # API service (Axios)
│   │   └── websocket.ts     # WebSocket service (Socket.IO)
│   ├── hooks/
│   │   └── useWebSocket.ts  # WebSocket hook
│   ├── store/
│   │   └── authStore.ts     # Auth state (Zustand)
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   ├── lib/
│   │   └── utils.ts         # Utility functions
│   ├── config/
│   │   └── env.ts           # Environment config
│   ├── styles/
│   │   └── globals.css      # Global styles
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── package.json
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

## Common Tasks

### Add a New Page
1. Create component in `src/pages/MyNewPage.tsx`
2. Add route in `src/App.tsx`
3. Update navigation in `src/components/layout/Header.tsx`

### Add a New API Endpoint
1. Add method to `src/services/api.ts`
2. Define TypeScript interface in `src/types/index.ts`
3. Use in your component

### Style a Component
1. Use Tailwind utility classes
2. Or create custom styles in `globals.css`
3. For reusable components, use `cn()` utility from `lib/utils.ts`

## Debugging

### Check API Calls
Open browser DevTools > Network tab to see all API requests and responses.

### Check WebSocket Connection
Open browser DevTools > Console to see WebSocket connection logs.

### Check Auth State
```javascript
// In browser console
localStorage.getItem('junqo-auth')
```

### Clear Auth State
```javascript
// In browser console
localStorage.removeItem('junqo-auth')
// Then refresh the page
```

## Troubleshooting

### CORS Errors
- Make sure backend CORS_ORIGINS includes your frontend URL
- Use `npm run dev` (with proxy) instead of `npm run dev:remote`

### WebSocket Not Connecting
- Check that you're logged in
- Check that backend WebSocket server is running
- Check browser console for errors

### Styles Not Loading
```bash
npm run dev  # Stop the dev server
rm -rf node_modules/.vite  # Clear Vite cache
npm run dev  # Restart
```

### TypeScript Errors
```bash
npm run lint  # Check for TypeScript errors
```

## Support

For issues or questions:
1. Check this guide
2. Check `BACKEND_INTEGRATION_SUMMARY.md`
3. Check `MIGRATION_GUIDE.md`
4. Contact the development team

## Next Steps

1. **Set up your profile** - Add bio, skills, experience
2. **Upload your CV** - Get AI-powered feedback
3. **Practice interviews** - Improve your interview skills
4. **Browse offers** - Find your next opportunity
5. **Connect with companies** - Start conversations

## Happy Coding! 🎉
