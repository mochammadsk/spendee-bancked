const { Schema, model } = require('mongoose');

const categorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['expense', 'income'], required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = model('Category', categorySchema);
