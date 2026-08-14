import { Clerk } from '@clerk/clerk-sdk-node';

// Still need Clerk SDK for some operations
export const clerk = new Clerk({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

// For Clerk Express middleware
export const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY!;
export const CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY!;