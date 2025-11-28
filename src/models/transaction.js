const { Schema, model } = require('mongoose');

const transactionSchema = new Schema(
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

module.exports = model('Transaction', transactionSchema);
