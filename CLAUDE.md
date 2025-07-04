# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14 real estate website (NPI Consultoria) with the following key characteristics:

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom components
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Admin SDK
- **File Storage**: AWS S3 integration
- **Package Manager**: pnpm (specified in package.json)
- **Code Quality**: Biome for formatting and linting

## Common Commands

### Development
```bash
pnpm dev                 # Start development server with Turbopack on port 3000
pnpm build              # Production build
pnpm start              # Start production server
```

### Code Quality
```bash
pnpm lint               # Next.js linting
pnpm lint:biome         # Biome linting
pnpm format             # Format code with Biome
pnpm check              # Biome check with auto-fix
```

## Architecture

### Directory Structure
- `/src/app/` - Next.js App Router pages and layouts
- `/src/app/api/` - API routes for backend functionality
- `/src/app/components/` - Reusable UI components
- `/src/app/models/` - Mongoose data models
- `/src/app/lib/` - Utility libraries (MongoDB, Firebase, etc.)
- `/src/app/store/` - Zustand state management
- `/src/app/utils/` - Helper functions and formatters
- `/src/app/admin/` - Admin panel components and pages
- `/public/` - Static assets and images

### Key Features
- **Property Management**: Full CRUD operations for real estate listings
- **Admin Panel**: Complete admin interface at `/admin`
- **Property Search**: Advanced filtering and map integration
- **SEO Optimization**: Dynamic sitemap and structured data
- **Image Optimization**: Next.js Image component with CDN support
- **Responsive Design**: Mobile-first Tailwind CSS implementation

### URL Structure
The project uses a custom URL rewriting system via middleware:
- Public URLs: `/imovel-{id}/{slug}` (e.g., `/imovel-123/apartamento-centro`)
- Internal routing: `/imovel/{id}/{slug}`
- Automatic slug generation from property names

### State Management
- **Zustand stores**: Located in `/src/app/store/` and `/src/app/stores/`
- **React Query**: For API state management (`@tanstack/react-query`)

### Database Models
Key models in `/src/app/models/`:
- `Imovel.ts` - Property listings
- `Corretores.ts` - Real estate agents
- `Proprietarios.ts` - Property owners
- `Content.ts` - Site content management

### API Structure
- `/api/imoveis/` - Property operations
- `/api/admin/` - Admin operations
- `/api/condominios/` - Condominium data
- `/api/search/` - Search functionality

### Environment Variables Required
- `MONGODB_URI` - MongoDB connection string
- Firebase configuration for admin operations
- AWS S3 credentials for file uploads

### Important Notes
- TypeScript build errors are ignored in development (`ignoreBuildErrors: true`)
- Image optimization configured for multiple CDN hostnames
- Middleware handles automatic URL redirects for SEO-friendly URLs
- Uses standalone output for deployment optimization