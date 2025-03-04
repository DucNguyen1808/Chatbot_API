import bcrypt from 'bcryptjs';
import { Schema, model } from 'mongoose';
export interface IUser {
  name?: string;
  email: string;
  avatar?: string;
  password: string;
  google_id?: string;
  checkPassword: (password: string) => Promise<boolean>;
}
const userSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    avatar: String,
    password: { type: String, required: true, minlength: 8 },
    google_id: String
  },
  { timestamps: true }
);
userSchema.methods.checkPassword = async function (password: string) {
  const result = await bcrypt.compare(password, this.password);
  return result;
};
userSchema.pre('save', function () {
  const salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(this.password, salt);
});
const User = model<IUser>('User', userSchema);

export default User;
