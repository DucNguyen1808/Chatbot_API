import bcrypt from 'bcryptjs';
import argon2 from 'argon2';
import mongoose, { Schema, model } from 'mongoose';
import { boolean, string } from 'zod';
import Conversation from './Conversation';
export interface IUser {
  name?: string;
  email: string;
  avatar?: string;
  password: string;
  google_id?: string;
  checkPassword: (password: string) => Promise<boolean>;
  conversation: [mongoose.Types.ObjectId];
  role: 'user' | 'admin';
  support: [mongoose.Types.ObjectId];
  resetPasswordToken: string | undefined;
  resetPasswordExpire: number | undefined;
  state: boolean;
  createdAt: number;
  updatedAt: number;
}
const userSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    avatar: String,
    password: { type: String, required: true, minlength: 8 },
    google_id: String,
    conversation: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }],
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    support: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Iframe' }],
    state: { type: Boolean, default: true },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Number }
  },
  { timestamps: true }
);

userSchema.methods.checkPassword = async function (password: string) {
  return argon2.verify(this.password, password);
};
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.password.startsWith('$argon2')) return next();
  this.password = await argon2.hash(this.password);
  next();
});
const User = model<IUser>('User', userSchema);

export default User;
