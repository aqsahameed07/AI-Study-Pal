import { createClerkClient } from '@clerk/clerk-sdk-node';

export const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY!;
export const CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY!;