import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICategory extends Document {
  userId: Types.ObjectId | string;
  type: 'expense' | 'income';
  name: string;
}

const categorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['expense', 'income'], required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICategory>('Category', categorySchema);
