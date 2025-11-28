const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    full_name: { type: String, required: true },
    user_name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  return { id: _id, ...object };
});

module.exports = model('User', userSchema);
