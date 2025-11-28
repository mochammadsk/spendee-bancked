const { Schema, model } = require('mongoose');

const incomeEntrySchema = new Schema(
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

module.exports = model('IncomeEntry', incomeEntrySchema);
