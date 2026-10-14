import mongoose, { Document, Schema } from 'mongoose';

export interface ISubmission extends Document {
  campaignId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  postLink: string;
  views: number;
  payout: number;
  previousPayout: number;
  viewHistory: {
    views: number;
    payout: number;
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>({
  campaignId: {
    type: Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postLink: {
    type: String,
    required: true
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  payout: {
    type: Number,
    default: 0,
    min: 0
  },
  viewHistory: [{
    views: {
      type: Number,
      required: true
    },
    payout: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  previousPayout: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

export default mongoose.model<ISubmission>('Submission', submissionSchema);
