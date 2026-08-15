import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  profileImage?: string;
  settings: {
    darkMode: boolean;
    notifications: boolean;
    studyReminders: boolean;
  };
  stats: {
    totalStudyTime: number; // in minutes
    totalQuizzesTaken: number;
    totalFlashcardsCreated: number;
    averageQuizScore: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    profileImage: String,
    settings: {
      darkMode: { type: Boolean, default: false },
      notifications: { type: Boolean, default: true },
      studyReminders: { type: Boolean, default: true },
    },
    stats: {
      totalStudyTime: { type: Number, default: 0 },
      totalQuizzesTaken: { type: Number, default: 0 },
      totalFlashcardsCreated: { type: Number, default: 0 },
      averageQuizScore: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Update fullName before saving
UserSchema.pre('save', function (next) {
  if (this.firstName || this.lastName) {
    this.fullName = `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
  next();
});

export const User = mongoose.model<IUser>('User', UserSchema);