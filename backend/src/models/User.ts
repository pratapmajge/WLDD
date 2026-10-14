import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'brand' | 'creator';
  name: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['brand', 'creator'],
    required: true
  },
  name: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', userSchema);
