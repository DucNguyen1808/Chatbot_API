import mongoose from 'mongoose';

const Setting = new mongoose.Schema(
  {
    api_key: { type: String, require: true }
  },
  { timestamps: true }
);
Setting.pre('save', async function (next) {
  if (this.isNew) {
    await mongoose.model('Setting').deleteMany({});
  }
  next();
});
export default mongoose.model('Setting', Setting);
