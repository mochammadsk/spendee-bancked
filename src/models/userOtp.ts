import mongoose, { Document, Schema, Types } from 'mongoose';

export type UserOtpPurpose = 'Verify Account' | 'Forgot Password';
export interface IUserOtp extends Document {
  user_id: Types.ObjectId;
  otp: string;
  purpose: UserOtpPurpose;
  resend_count: number;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userOtpSchema = new Schema<IUserOtp>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    otp: { type: String, required: true },
    purpose: {
      type: String,
      enum: ['Verify Account', 'Forgot Password'],
      required: true,
    },
    resend_count: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

userOtpSchema.method('toJSON', function () {
  const { __v, _id, ...rest } = this.toObject();
  return { id: _id, ...rest };
});

export default mongoose.model<IUserOtp>('UserOtp', userOtpSchema);
