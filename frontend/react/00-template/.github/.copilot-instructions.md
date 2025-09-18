# React Copilot Instructions

## Project Setup
- Use React 18+ with latest features (Concurrent Rendering, Suspense)
- Use Vite or Create React App for project scaffolding
- Implement TypeScript for type safety and better development experience
- Use modern CSS solutions (CSS Modules, Styled Components, Tailwind CSS)
- Implement proper state management (Context API, Zustand, Redux Toolkit)
- Use React Router for client-side routing

## Coding Style Guidelines
- Use functional components with React Hooks
- Follow React naming conventions (PascalCase for components)
- Use TypeScript interfaces for component props and state
- Implement proper component composition patterns
- Use custom hooks for reusable stateful logic
- Follow the principle of single responsibility for components
- Use proper ESLint and Prettier configuration
- Implement proper error boundaries for error handling

## Code Organization
- src/components/ - Reusable UI components
- src/pages/ - Page-level components
- src/hooks/ - Custom React hooks
- src/context/ - React Context providers
- src/services/ - API calls and external services
- src/utils/ - Utility functions and helpers
- src/types/ - TypeScript type definitions
- src/assets/ - Static assets (images, fonts, icons)
- src/styles/ - Global styles and theme configuration

## Best Practices
- Use React.memo() for performance optimization when needed
- Implement proper key props for list rendering
- Use useCallback and useMemo for expensive operations
- Implement proper form handling with controlled components
- Use Suspense and Error Boundaries for better UX
- Implement proper accessibility (ARIA attributes, semantic HTML)
- Use React DevTools for debugging and profiling
- Follow React performance best practices

## State Management
- Use useState and useReducer for local component state
- Use Context API for sharing state across component tree
- Consider Zustand or Redux Toolkit for complex global state
- Implement proper state normalization for complex data
- Use React Query or SWR for server state management
- Avoid prop drilling with proper state architecture
- Use immer for immutable state updates

## Testing
- Use React Testing Library for component testing
- Write integration tests for user workflows
- Use Jest for unit testing utilities and hooks
- Implement E2E testing with Cypress or Playwright
- Test accessibility with testing-library/jest-dom
- Use MSW (Mock Service Worker) for API mocking
- Follow testing best practices (AAA pattern, descriptive test names)

## Performance Optimization
- Use React.lazy() for code splitting
- Implement proper bundle splitting strategies
- Use React Profiler to identify performance bottlenecks
- Optimize re-renders with React.memo and useMemo
- Implement virtual scrolling for large lists
- Use proper image optimization and lazy loading
- Minimize bundle size with tree shaking