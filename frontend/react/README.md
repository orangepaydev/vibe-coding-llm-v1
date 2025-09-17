# React Projects

This directory contains React-based web applications for building interactive user interfaces with modern JavaScript.

## Prerequisites

- Node.js 18+ (Node.js 20+ recommended)
- npm, pnpm, or yarn package manager
- Git for version control
- Code editor with React and TypeScript support (VS Code recommended)

## Setup Instructions

1. **Install Node.js**
   ```bash
   # macOS (using nvm)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 20
   nvm use 20
   
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Create New React Project**

   **Using Vite (Recommended):**
   ```bash
   npm create vite@latest my-react-app -- --template react-ts
   cd my-react-app
   npm install
   npm run dev
   ```

   **Using Create React App:**
   ```bash
   npx create-react-app my-react-app --template typescript
   cd my-react-app
   npm start
   ```

   **Using Next.js (for SSR/SSG):**
   ```bash
   npx create-next-app@latest my-react-app --typescript --tailwind --eslint
   cd my-react-app
   npm run dev
   ```

## Project Structure

### Vite React Project
```
react-project/
├── src/
│   ├── components/      # Reusable components
│   │   ├── ui/         # Basic UI components
│   │   ├── layout/     # Layout components
│   │   └── forms/      # Form components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── context/        # React Context providers
│   ├── services/       # API calls and services
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript definitions
│   ├── assets/         # Static assets
│   ├── styles/         # CSS/SCSS files
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── public/             # Static files
├── dist/               # Build output
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Essential Commands

```bash
# Development
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues

# Testing
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
npm run test:e2e        # Run E2E tests

# Code quality
npm run type-check      # TypeScript type checking
npm run format          # Format code with Prettier
```

## Configuration Files

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Best Practices

- Use functional components with React Hooks
- Implement proper TypeScript types for all props and state
- Use custom hooks for reusable stateful logic
- Implement proper error boundaries
- Use React.memo() for performance optimization when needed
- Follow accessibility guidelines (ARIA attributes, semantic HTML)
- Use proper form validation and error handling
- Implement proper loading and error states
- Use consistent naming conventions
- Keep components focused and small

## Component Example

```typescript
// src/components/UserCard.tsx
import React from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface UserCardProps {
  user: User;
  onUserClick?: (user: User) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onUserClick }) => {
  const handleClick = () => {
    onUserClick?.(user);
  };

  return (
    <div 
      className="user-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {user.avatar && (
        <img src={user.avatar} alt={`${user.name}'s avatar`} />
      )}
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
};
```

## Custom Hook Example

```typescript
// src/hooks/useApi.ts
import { useState, useEffect } from 'react';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(url: string): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}
```

## Recommended Libraries

- **Routing**: React Router, Reach Router
- **State Management**: Zustand, Redux Toolkit, Context API
- **UI Libraries**: Material-UI, Ant Design, Chakra UI, Mantine
- **Styling**: Styled Components, Emotion, Tailwind CSS
- **Forms**: React Hook Form, Formik
- **HTTP Client**: Axios, Fetch API, React Query
- **Testing**: React Testing Library, Jest, Cypress, Playwright
- **Dev Tools**: React DevTools, Redux DevTools

## Testing Example

```typescript
// src/components/__tests__/UserCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from '../UserCard';

const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
};

describe('UserCard', () => {
  it('renders user information', () => {
    render(<UserCard user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onUserClick when clicked', () => {
    const mockOnClick = jest.fn();
    render(<UserCard user={mockUser} onUserClick={mockOnClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledWith(mockUser);
  });
});
```

## Performance Tips

- Use React.lazy() for code splitting
- Implement virtual scrolling for large lists
- Use useMemo and useCallback for expensive operations
- Optimize bundle size with proper imports
- Use React DevTools Profiler to identify bottlenecks
- Implement proper image optimization
- Use service workers for caching

## Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
npm install -g vercel
vercel

# Deploy to Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## Resources

- [React Documentation](https://react.dev/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [React Router](https://reactrouter.com/)
- [Vite Documentation](https://vitejs.dev/)