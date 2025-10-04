const { Schema, Types, model } = require('mongoose');

const accountSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    name: {
      type: String,
      enum: ['Cash', 'BRI', 'BLU', 'SeaBank', 'ShopeePay'],
      required: true,
    },
    opening_balance: { type: Number, required: true, default: 0 },
    current_balance: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

accountSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  return { id: _id, ...object };
});

module.exports = model('Account', accountSchema);
