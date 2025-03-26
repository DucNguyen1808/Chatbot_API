import mongoose from 'mongoose';

const Prompt = new mongoose.Schema(
  {
    title: { type: String, require: true },
    content: { type: String, require }
  },
  { timestamps: true }
);
export default mongoose.model('Prompt', Prompt);
