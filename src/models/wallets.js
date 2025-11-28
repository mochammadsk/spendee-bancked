const { Schema, model } = require('mongoose');

const walletSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['bank', 'cash', 'e-wallet'],
      required: true,
    },
    name: { type: String, required: true },
    initial_balance: { type: Number, required: true, default: 0 },
    current_balance: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = model('Wallet', walletSchema);
