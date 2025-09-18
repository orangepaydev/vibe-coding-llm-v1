# Astro Projects

This directory contains Astro-based web projects for building fast, content-focused websites with modern web technologies.

## Prerequisites

- Node.js 18+ (Node.js 20+ recommended)
- npm, pnpm, or yarn package manager
- Git for version control
- Code editor with Astro support (VS Code recommended)

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
   
   # Windows (download from nodejs.org)
   ```

2. **Install Package Manager**
   ```bash
   # pnpm (recommended for Astro)
   npm install -g pnpm
   
   # yarn (alternative)
   npm install -g yarn
   ```

3. **Create New Astro Project**
   ```bash
   # Using create-astro
   npm create astro@latest my-astro-site
   cd my-astro-site
   
   # Or with pnpm
   pnpm create astro@latest my-astro-site
   
   # Or with yarn
   yarn create astro my-astro-site
   ```

4. **Install Dependencies and Start Development Server**
   ```bash
   npm install
   npm run dev
   
   # Or with pnpm
   pnpm install
   pnpm dev
   ```

## Project Structure

```
astro-project/
├── src/
│   ├── components/      # Reusable components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── Card.astro
│   ├── layouts/         # Page layouts
│   │   ├── Layout.astro
│   │   └── BlogPost.astro
│   ├── pages/           # File-based routing
│   │   ├── index.astro
│   │   ├── about.astro
│   │   └── blog/
│   │       ├── index.astro
│   │       └── [slug].astro
│   ├── content/         # Content collections
│   │   ├── config.ts
│   │   └── blog/
│   ├── styles/          # Global styles
│   │   └── global.css
│   ├── assets/          # Optimized assets
│   └── env.d.ts
├── public/              # Static files
│   ├── favicon.ico
│   └── images/
├── astro.config.mjs     # Astro configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Essential Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run astro            # Run Astro CLI

# Code quality
npm run astro check      # Type checking
npm run astro sync       # Sync content types

# Testing (if configured)
npm run test             # Run tests
npm run test:e2e         # Run E2E tests
```

## Configuration Example

### astro.config.mjs
```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',
  integrations: [
    tailwind(),
    react(),
    sitemap()
  ],
  output: 'static', // or 'server' for SSR
  vite: {
    optimizeDeps: {
      exclude: ['@resvg/resvg-js']
    }
  }
});
```

## Best Practices

- Use Astro components (.astro) for static content
- Use framework components (React, Vue, Svelte) for interactivity
- Implement proper TypeScript types for component props
- Use content collections for structured content
- Optimize images with Astro's Image component
- Implement proper SEO with meta tags and structured data
- Use scoped styles to avoid CSS conflicts
- Follow accessibility guidelines
- Optimize for Core Web Vitals
- Use proper error handling and 404 pages

## Astro Component Example

```astro
---
// Component script (runs at build time)
export interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<!-- Component template -->
<article class="card">
  <h2>{title}</h2>
  {description && <p>{description}</p>}
  <slot />
</article>

<style>
  .card {
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
  
  h2 {
    margin: 0 0 0.5rem 0;
    color: #333;
  }
</style>
```

## Content Collections Example

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string(),
    tags: z.array(z.string()),
    image: z.string().optional(),
  }),
});

export const collections = {
  'blog': blogCollection,
};
```

## Recommended Integrations

- **Styling**: @astrojs/tailwind, @astrojs/mdx
- **Frameworks**: @astrojs/react, @astrojs/vue, @astrojs/svelte
- **SEO**: @astrojs/sitemap, @astrojs/robots-txt
- **Performance**: @astrojs/compress, @astrojs/critters
- **Development**: @astrojs/ts, @astrojs/check
- **Deployment**: @astrojs/vercel, @astrojs/netlify, @astrojs/cloudflare

## Testing Setup

```bash
# Install testing dependencies
npm install --save-dev vitest jsdom @testing-library/dom

# Install E2E testing
npm install --save-dev @playwright/test
```

## Environment Variables

```bash
# .env
PUBLIC_SITE_URL=https://example.com
SECRET_API_KEY=your-secret-key

# Access in Astro components
const siteUrl = import.meta.env.PUBLIC_SITE_URL;
```

## Deployment

```bash
# Build for production
npm run build

# Static hosting (Netlify, Vercel, GitHub Pages)
# Upload dist/ folder

# Server-side rendering
# Deploy to Vercel, Netlify Functions, or Node.js server
```

## Performance Tips

- Use Astro's Image component for automatic optimization
- Implement lazy loading for images and components
- Use partial hydration with client:load, client:idle directives
- Minimize JavaScript bundle size
- Use CDN for static assets
- Implement proper caching headers
- Optimize CSS with critical CSS extraction

## Resources

- [Astro Documentation](https://docs.astro.build/)
- [Astro Examples](https://github.com/withastro/astro/tree/main/examples)
- [Astro Integrations](https://astro.build/integrations/)
- [Astro Discord Community](https://astro.build/chat)