# Astro Copilot Instructions

## Project Setup
- Use Astro 4+ for the latest features and performance improvements
- Use Node.js 18+ and npm/pnpm/yarn for package management
- Choose appropriate integrations (React, Vue, Svelte, Tailwind CSS)
- Implement proper TypeScript configuration for type safety
- Use Astro's built-in optimizations (image optimization, code splitting)
- Configure proper SEO and meta tags for better search rankings

## Coding Style Guidelines
- Follow Astro component conventions (.astro files)
- Use TypeScript for type safety and better development experience
- Organize components with clear separation of concerns
- Use consistent naming conventions (PascalCase for components)
- Implement proper component props validation
- Use Astro's scoped styles or CSS modules for styling
- Follow accessibility best practices (ARIA labels, semantic HTML)
- Keep components small and focused on single responsibilities

## Code Organization
- src/components/ - Reusable UI components
- src/layouts/ - Page layout templates
- src/pages/ - File-based routing pages
- src/styles/ - Global styles and CSS utilities
- src/content/ - Content collections (blog posts, etc.)
- src/assets/ - Static assets (images, fonts)
- public/ - Public static files
- src/utils/ - Utility functions and helpers

## Best Practices
- Use Astro Islands for interactive components
- Implement proper image optimization with Astro's Image component
- Use content collections for structured content management
- Implement proper error boundaries and error handling
- Use environment variables for configuration
- Optimize for Core Web Vitals and performance metrics
- Implement proper caching strategies
- Use TypeScript interfaces for component props

## Performance Optimization
- Leverage Astro's zero-JS by default architecture
- Use partial hydration for interactive components
- Implement proper image optimization and lazy loading
- Use content collections for efficient content management
- Minimize bundle size with proper code splitting
- Implement service workers for offline functionality
- Use CDN for static asset delivery

## SEO and Accessibility
- Implement proper meta tags and Open Graph data
- Use semantic HTML elements
- Ensure proper heading hierarchy (h1-h6)
- Add alt text for images and ARIA labels
- Implement structured data (JSON-LD)
- Ensure keyboard navigation support
- Test with screen readers and accessibility tools
- Implement proper color contrast ratios

## Testing
- Use Vitest for unit testing
- Implement E2E testing with Playwright or Cypress
- Use Astro's built-in testing utilities
- Test accessibility with automated tools
- Implement visual regression testing
- Test performance with Lighthouse CI