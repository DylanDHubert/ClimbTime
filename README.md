# NAMETBD - Climbing! Social Media Platform

A modern social media platform built with Next.js, React, Tailwind CSS, and Prisma.

## Features

- **Authentication**: User registration and login with NextAuth
- **Profile Management**: Create and edit your profile, including bio, profile picture, and banner
- **Posts**: Create, view, and interact with posts
- **Social Interaction**:
  - **Like Posts**: Show appreciation for content
  - **Comment on Posts**: Engage in discussions
  - **Share Posts**: Spread content with your followers
  - **Follow/Unfollow Users**: Subscribe to content from users you're interested in
- **Real-time Messaging**: Private conversations between users
- **Explore/Search**: Find posts and users

## Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **Tailwind CSS 4**: Utility-first CSS framework for styling
- **Headless UI**: Unstyled, accessible UI components
- **Heroicons**: Beautiful hand-crafted SVG icons

### Backend
- **Next.js API Routes**: Backend API endpoints
- **Prisma ORM**: Database access and management
- **PostgreSQL**: Database (hosted on Neon)
- **NextAuth.js**: Authentication

### Other Tools
- **Zod**: Schema validation
- **date-fns**: Date formatting
- **TypeScript**: Type safety
- **UploadThing**: File uploads

## UI/UX Design

The platform follows a modern, clean design approach:

- **Responsive Design**: Works on mobile, tablet, and desktop
- **Dark/Light Mode**: Support for user preference
- **Component-based Architecture**: Reusable UI components
- **Accessibility**: Semantic HTML and ARIA attributes
- **Loading States**: Feedback for user actions
- **Optimistic Updates**: Immediate UI response before server confirmation

All UI components are styled using Tailwind CSS, providing a consistent look and feel while enabling rapid development. The design system uses:

- A blue primary color palette
- Clean typography with good contrast
- Subtle animations and transitions
- Consistent spacing and layout

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Setup

The application uses Prisma with PostgreSQL. To set up the database:

1. Configure the database connection in `.env`
2. Run migrations: `npx prisma migrate dev`
3. Generate the Prisma client: `npx prisma generate`

## Environment Variables

Create a `.env` file in the root of the project with the following variables:

```
DATABASE_URL="your-postgresql-connection-string"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
UPLOADTHING_SECRET='your-uploadthing-secret'
UPLOADTHING_APP_ID='your-uploadthing-app-id'
UPLOADTHING_TOKEN='your-uploadthing-token'
```

## Deployment

The project is deployed on Vercel. For deployment, make sure to set the environment variables in your Vercel project settings.

## Learn More

For more information on the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/getting-started/introduction)
