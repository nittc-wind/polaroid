# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Next.js 15.5.2 project with TypeScript, using the App Router architecture and Tailwind CSS v4. The project uses Turbopack for faster development builds and includes modern React 19.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack (runs on http://localhost:3000)
- `npm run build` - Build production bundle with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality

### Package Management
- `npm install` - Install dependencies
- `npm install <package>` - Add new dependency
- `npm install -D <package>` - Add dev dependency

## Architecture & Structure

### App Router Structure
- `src/app/` - App Router pages and layouts (Next.js 13+ App Directory)
- `src/app/layout.tsx` - Root layout with Geist font configuration and global styles
- `src/app/page.tsx` - Home page component
- `src/app/globals.css` - Global CSS with Tailwind imports and CSS variables

### Key Technologies
- **Next.js 15.5.2** with App Router
- **React 19** with modern features
- **TypeScript 5** with strict configuration
- **Tailwind CSS v4** with PostCSS plugin architecture
- **Turbopack** for faster dev builds
- **Geist fonts** (sans and mono variants) from next/font/google

### TypeScript Configuration
- Path alias: `@/*` maps to `./src/*`
- Strict mode enabled with comprehensive type checking
- ESNext module resolution with bundler strategy

### Styling System
- Tailwind CSS v4 with new `@import "tailwindcss"` syntax
- CSS custom properties for theming (light/dark mode support)
- Responsive design patterns using Tailwind grid and flexbox utilities
- Dark mode support via `prefers-color-scheme`

## Development Patterns

### Component Structure
- Server components by default (React Server Components)
- TypeScript interfaces for props using `Readonly<>` pattern
- Next.js Image component for optimized images
- CSS-in-JS avoided in favor of Tailwind utility classes

### File Organization
- App Router file-based routing in `src/app/`
- Static assets in `public/` directory
- Global styles and Tailwind configuration in app directory

### Fonts & Assets
- Geist Sans and Geist Mono fonts loaded via `next/font/google`
- CSS variables for consistent theming: `--font-geist-sans`, `--font-geist-mono`
- SVG icons stored in `public/` directory

## Configuration Files
- `next.config.ts` - Next.js configuration (currently minimal)
- `tsconfig.json` - TypeScript configuration with path aliases
- `eslint.config.mjs` - ESLint flat config with Next.js rules
- `postcss.config.mjs` - PostCSS configuration for Tailwind CSS v4
- `package.json` - Dependencies and scripts with Turbopack integration
