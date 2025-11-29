const { Schema, model } = require('mongoose');

const userOtpSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    otp: { type: String, required: true },
    purpose: {
      type: String,
      enum: ['Verify Account', 'Forgot Password'],
      required: true,
    },
    resend_count: { type: Number, default: 0 },
    expires_at: { type: Date, required: true },
  },
  { timestamps: true }
);

userOtpSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  return { id: _id, ...object };
});

module.exports = model('UserOtp', userOtpSchema);
