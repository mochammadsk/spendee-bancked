import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IIncomeEntry extends Document {
  userId: Types.ObjectId | string;
  incomeSourceId?: Types.ObjectId | string;
  walletId?: Types.ObjectId | string;
  amount: number;
  date: Date;
  note: string;
}

const incomeEntrySchema = new Schema<IIncomeEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    incomeSourceId: {
      type: Schema.Types.ObjectId,
      ref: 'IncomeSource',
      required: true,
    },
    walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    note: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IIncomeEntry>('IncomeEntry', incomeEntrySchema);
