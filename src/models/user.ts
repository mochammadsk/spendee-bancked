import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  full_name: string;
  user_name: string;
  password: string;
  verified: boolean;
}

const userSchema = new Schema<IUser>(
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

export default mongoose.model<IUser>('User', userSchema);
