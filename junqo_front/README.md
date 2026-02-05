# Junqo Frontend - React Edition

Modern, beautiful career platform built with React, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Routing
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Framer Motion** - Animations

## 📋 Prerequisites

- Node.js 20+ and npm
- (Optional) Docker for containerized deployment

## 🛠️ Installation

### Local Development

1. Install dependencies:
```bash
cd junqo_front
npm install
```

2. Create environment file:
```bash
cp config/exemple.env config/.env
```

3. Configure your `.env`:
```env
VITE_API_URL=http://localhost:4200/api/v1
```

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## 🐳 Docker Deployment

### Development
```bash
docker build -f dockerfile.dev -t junqo-front:dev --build-arg VITE_API_URL=http://localhost:4200/api/v1 .
docker run -p 80:80 junqo-front:dev
```

### Production
```bash
docker build -f dockerfile.prod -t junqo-front:prod --build-arg VITE_API_URL=https://api.junqo.fr/api/v1 .
docker run -p 80:80 junqo-front:prod
```

## 📁 Project Structure

```
junqo_front/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   └── layout/       # Layout components
│   ├── pages/            # Page components
│   ├── services/         # API & WebSocket services
│   ├── store/            # Zustand stores
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── types/            # TypeScript types
│   ├── styles/           # Global styles
│   ├── config/           # Configuration files
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── index.html            # HTML template
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
├── tailwind.config.js    # Tailwind config
└── README.md             # Documentation
```

## 🎨 Features

### For Students
- **Browse Offers** - Discover internships and job opportunities
- **CV Analysis** - Get AI-powered feedback on your CV
- **Interview Practice** - Practice with AI-powered interview simulations
- **Messaging** - Connect with recruiters
- **Profile Management** - Showcase your skills and experience

### For Companies
- **Post Offers** - Create and manage job postings
- **Browse Candidates** - Swipe-based candidate discovery
- **Dashboard** - Track applications and analytics
- **Messaging** - Communicate with candidates
- **Profile Management** - Build your company profile

## 🎯 Key Pages

- `/` - Welcome page
- `/login` - Authentication
- `/register` - User registration
- `/home` - Dashboard
- `/offers` - Job offers list
- `/offers/:id` - Offer details
- `/profile` - User profile
- `/cv` - CV analysis
- `/interview` - Interview practice
- `/messaging` - Messages
- `/recruiter/dashboard` - Recruiter dashboard
- `/recruiter/swiping` - Candidate swiping

## 🔐 Authentication

The app uses JWT-based authentication stored in localStorage via Zustand persist middleware. Protected routes automatically redirect to login if not authenticated.

## 🌐 API Integration

All API calls are handled through the centralized `apiService` in `src/services/api.ts`. The service automatically:
- Adds JWT tokens to requests
- Handles 401 errors and redirects to login
- Manages request/response interceptors

## 🔄 Real-time Features

WebSocket connection is managed by `wsService` in `src/services/websocket.ts`. Used for:
- Real-time messaging
- Notification updates
- Live application status changes

## 🎨 Theming

The app supports light and dark modes with automatic system preference detection. Theme can be toggled via the header menu.

## 📱 Responsive Design

Fully responsive design optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🧪 Code Quality

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## 🚀 Performance Optimizations

- Code splitting with React lazy loading
- Asset optimization with Vite
- Image compression
- CSS purging with Tailwind
- Gzip compression in production nginx
- Browser caching for static assets

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for type safety
3. Create reusable components in `components/`
4. Follow the file naming convention (PascalCase for components)
5. Update types in `src/types/` when needed

## 📄 License

See the main project LICENSE file.

## 🆘 Troubleshooting

### Port already in use
Change the port in `vite.config.ts`:
```ts
server: {
  port: 3001, // Change to any available port
}
```

### Build fails
Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### WebSocket connection fails
Check that:
1. Backend server is running
3. CORS is properly configured on backend

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Zustand](https://zustand-demo.pmnd.rs)
