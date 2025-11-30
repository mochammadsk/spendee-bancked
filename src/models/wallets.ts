import mongoose, { Document, Schema, Types } from 'mongoose';

export type WalletType = 'bank' | 'cash' | 'e-wallet';
export interface IWallet extends Document {
  userId: Types.ObjectId;
  type: WalletType;
  name: string;
  initial_balance: number;
  current_balance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['bank', 'cash', 'e-wallet'],
      required: true,
    },
    name: { type: String, required: true },
    initial_balance: { type: Number, required: true, default: 0 },
    current_balance: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

walletSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  return { id: _id, ...object };
});

walletSchema.pre('save', function (next) {
  if (
    this.isNew &&
    (this.current_balance === undefined || this.current_balance === null)
  ) {
    this.current_balance = this.initial_balance ?? 0;
  }
  next();
});

export default mongoose.model<IWallet>('Wallet', walletSchema);
