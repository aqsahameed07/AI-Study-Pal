import { Request, Response, NextFunction } from 'express';
import { clerkClient, verifyToken } from '@clerk/clerk-sdk-node';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phoneNumber?: string | null;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const payload = await verifyToken(token, {} as any);
    const rawUserId = typeof payload?.sub === 'string'
      ? payload.sub
      : typeof (payload as any)?.userId === 'string'
        ? (payload as any).userId
        : null;

    if (!rawUserId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    const user = await clerkClient.users.getUser(rawUserId);
    const primaryEmail = user.emailAddresses.find(
      (address) => address.id === user.primaryEmailAddressId
    ) ?? user.emailAddresses[0];

    if (!primaryEmail) {
      return res.status(401).json({
        success: false,
        message: 'No email associated with user',
      });
    }

    req.user = {
      userId: user.id,
      email: primaryEmail.emailAddress,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      phoneNumber: user.phoneNumbers?.[0]?.phoneNumber || null,
    };

    return next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

export default authMiddleware;
