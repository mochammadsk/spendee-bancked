import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IIncomeSource extends Document {
  userId: Types.ObjectId | string;
  type: 'bank' | 'cash' | 'e-wallet';
  name: string;
}

const incomeSourceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['bank', 'cash', 'e-wallet'], required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IIncomeSource>(
  'IncomeSource',
  incomeSourceSchema
);
