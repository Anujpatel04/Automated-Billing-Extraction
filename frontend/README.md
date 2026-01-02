# Frontend - Expense Management Platform

Modern React frontend for the expense management platform.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React Query
- Axios
- Recharts

## Quick Start

### Installation

```bash
npm install
```

### Configuration

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Development

```bash
npm run dev
```

Opens at http://localhost:3000

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── api/              # API service layer
├── components/       # Reusable components
│   ├── layout/      # Layout components
│   └── ui/          # UI primitives
├── pages/           # Page components
│   ├── auth/       # Authentication
│   ├── user/       # User pages
│   └── hr/         # HR pages
├── hooks/          # Custom hooks
├── routes/         # Route components
├── utils/          # Utilities
└── styles/         # Global styles
```

## Features

- JWT authentication
- Role-based routing
- Toast notifications
- Responsive design
- Real-time data updates
