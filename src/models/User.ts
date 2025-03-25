import bcrypt from 'bcryptjs';
import mongoose, { Schema, model } from 'mongoose';
export interface IUser {
  name?: string;
  email: string;
  avatar?: string;
  password: string;
  google_id?: string;
  checkPassword: (password: string) => Promise<boolean>;
  conversation: [mongoose.Types.ObjectId];
  role: 'user' | 'admin';
}
const userSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    avatar: String,
    password: { type: String, required: true, minlength: 8 },
    google_id: String,
    conversation: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }],
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
  },
  { timestamps: true }
);
userSchema.methods.checkPassword = async function (password: string) {
  const result = await bcrypt.compare(password, this.password);
  return result;
};
userSchema.pre('save', function () {
  this.password = bcrypt.hashSync(this.password);
});
const User = model<IUser>('User', userSchema);

export default User;
