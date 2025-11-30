import mongoose, { Schema, Types } from 'mongoose';

export interface ITransaction extends Document {
  userId: Types.ObjectId | string;
  walletId?: Types.ObjectId | string;
  fromWalletId?: Types.ObjectId | string;
  toWalletId?: Types.ObjectId | string;
  categoryId?: Types.ObjectId | string;
  incomeEntryId?: Types.ObjectId | string;
  amount: number;
  date?: Date;
  note: string;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    walletId: { type: Schema.Types.ObjectId, ref: 'Wallet' },
    fromWalletId: { type: Schema.Types.ObjectId, ref: 'Wallet' },
    toWalletId: { type: Schema.Types.ObjectId, ref: 'Wallet' },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    incomeEntryId: {
      type: Schema.Types.ObjectId,
      ref: 'IncomeEntry',
      required: true,
    },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    note: { type: String },
  },
  { timestamps: true }
);

transactionSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  return { id: _id, ...object };
});

export default mongoose.model<ITransaction>('Transaction', transactionSchema);
