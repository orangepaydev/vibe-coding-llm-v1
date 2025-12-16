# proj-init-next

A Next.js application built with TypeScript, Tailwind CSS, pnpm, and shadcn UI components.

## Features

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **shadcn UI** component library
- **pnpm** for package management
- **ESLint** for code linting
- **Prettier** with automatic formatting check before build

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (install with `npm install -g pnpm`)

### Installation

```bash
pnpm install
```

### Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build the application for production:

```bash
pnpm build
```

The build command will:

1. Check code formatting with Prettier
2. Build the Next.js application

### Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production (includes format check)
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

## Project Structure

```
proj-init-next/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── globals.css   # Global styles
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   │   └── ui/          # shadcn UI components
│   └── lib/             # Utility functions
├── .prettierrc.json      # Prettier configuration
├── eslint.config.mjs     # ESLint configuration
├── tailwind.config.ts    # Tailwind configuration
└── package.json          # Dependencies and scripts
```

## UI Components

The home page includes:

- A responsive container with max-width
- A top panel with title and description
- "Hello world" heading
- A button component from shadcn UI

## Code Quality

The project enforces code quality through:

- **ESLint** - Configured with Next.js recommended rules
- **Prettier** - Automatic code formatting with Tailwind CSS class sorting
- **Pre-build checks** - Format validation runs before every build

To format your code manually:

```bash
pnpm format
```

To check formatting without making changes:

```bash
pnpm format:check
```
