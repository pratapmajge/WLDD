import mongoose, { Document, Schema } from 'mongoose';

export interface IMilestone {
  views: number;
  payout: number;
}

export interface ICampaign extends Document {
  name: string;
  platform: 'Instagram' | 'YouTube';
  totalBudget: number;
  milestones: IMilestone[];
  brandId: mongoose.Types.ObjectId;
  spent: number;
  isActive: boolean;
  createdAt: Date;
}

const campaignSchema = new Schema<ICampaign>({
  name: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    enum: ['Instagram', 'YouTube'],
    required: true
  },
  totalBudget: {
    type: Number,
    required: true,
    min: 0
  },
  milestones: [{
    views: {
      type: Number,
      required: true,
      min: 0
    },
    payout: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  brandId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  spent: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure milestones are sorted by views ascending
campaignSchema.pre('save', function(this: ICampaign, next: () => void) {
  if (this.milestones) {
    this.milestones.sort((a: IMilestone, b: IMilestone) => a.views - b.views);
  }
  next();
});

export default mongoose.model<ICampaign>('Campaign', campaignSchema);
