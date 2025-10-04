const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    user_name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['owner'], default: 'owner' },
  },
  { timestamps: true }
);

module.exports = model('User', userSchema);
