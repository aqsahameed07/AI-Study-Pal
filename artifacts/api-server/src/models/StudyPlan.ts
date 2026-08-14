import mongoose, { Schema, Document } from 'mongoose';

export interface IStudyPlan extends Document {
  userId: string;
  title: string;
  subject: string;
  description?: string;
  goals: Array<{
    text: string;
    completed: boolean;
    dueDate?: Date;
  }>;
  tasks: Array<{
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in-progress' | 'completed';
    dueDate?: Date;
    estimatedTime?: number;
  }>;
  schedule?: {
    startDate?: Date;
    endDate?: Date;
    studyDays: Array<{
      day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
      sessions: Array<{
        startTime: string;
        endTime: string;
        topic: string;
      }>;
    }>;
  };
  progress: {
    completed: number;
    status: 'not-started' | 'in-progress' | 'completed';
  };
  createdAt: Date;
  updatedAt: Date;
}

const StudyPlanSchema = new Schema<IStudyPlan>(
  {
    userId: { 
      type: String, 
      required: true, 
      index: true 
    },
    title: { 
      type: String, 
      required: true, 
      trim: true 
    },
    subject: { 
      type: String, 
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    goals: [{
      text: {
        type: String,
        required: true,
      },
      completed: { 
        type: Boolean, 
        default: false 
      },
      dueDate: Date,
    }],
    tasks: [{
      title: {
        type: String,
        required: true,
      },
      description: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending',
      },
      dueDate: Date,
      estimatedTime: Number,
    }],
    schedule: {
      startDate: Date,
      endDate: Date,
      studyDays: [{
        day: {
          type: String,
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        },
        sessions: [{
          startTime: String,
          endTime: String,
          topic: String,
        }],
      }],
    },
    progress: {
      completed: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 100,
      },
      status: {
        type: String,
        enum: ['not-started', 'in-progress', 'completed'],
        default: 'not-started',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Update progress before saving
StudyPlanSchema.pre('save', function(next) {
  const totalTasks = this.tasks.length;
  if (totalTasks > 0) {
    const completedTasks = this.tasks.filter(t => t.status === 'completed').length;
    this.progress.completed = Math.round((completedTasks / totalTasks) * 100);
    
    if (this.progress.completed === 100) {
      this.progress.status = 'completed';
    } else if (this.progress.completed > 0) {
      this.progress.status = 'in-progress';
    }
  }
  next();
});

export const StudyPlan = mongoose.model<IStudyPlan>('StudyPlan', StudyPlanSchema);