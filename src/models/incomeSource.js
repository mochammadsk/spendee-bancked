const { Schema, model } = require('mongoose');

const incomeSourceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['bank', 'cash', 'e-wallet'], required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = model('IncomeSource', incomeSourceSchema);
