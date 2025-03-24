# NAMETBD - Climbing Social Media Platform

Built with Next.js, React, Tailwind CSS, and Prisma.

## BASIC FEATURES

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

## TECH STACK

### FRONTEND
- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **Tailwind CSS 4**: Utility-first CSS framework for styling
- **Headless UI**: Unstyled, accessible UI components
- **Heroicons**: Beautiful hand-crafted SVG icons

### BACKEND
- **Next.js API Routes**: Backend API endpoints
- **Prisma ORM**: Database access and management
- **PostgreSQL**: Database (hosted on **Neon**)
- **NextAuth.js**: Authentication

### OTHER
- **Zod**: Schema validation
- **date-fns**: Date formatting
- **TypeScript**: Type safety
- **UploadThing**: File uploads

## RUNNING ON LOCAL (DEV SERVER)

```bash
npm run dev
```

## DATABASE

Prisma with PostgreSQL.

1. Configure the database connection in `.env`
2. Run migrations: `npx prisma migrate dev`
3. Generate the Prisma client: `npx prisma generate`

## VERCEL DEPLOYMENT

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=UN-NEEDED (FOR VERCEL, NEEDED FOR LOCAL)
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
UPLOADTHING_TOKEN=
```

## DEPLOYMENT

See above section. Ensure **Enviormental Variables** (in settings) are up to date.

## MORE DOCUMENTATION

- See **documenation.md** for API endpoint / payload information.
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/getting-started/introduction)
