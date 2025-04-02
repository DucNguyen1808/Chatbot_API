import mongoose from 'mongoose';
import { boolean } from 'zod';

export const Mesages = new mongoose.Schema({
  query: { type: String, require },
  answer: { type: String, require },
  createdAt: { type: Date, default: Date.now },
  feedback: { state: Boolean, content: String }
});
const Conversation = new mongoose.Schema(
  {
    conversation_id: String,
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, require },
    bot_id: { type: String, require },
    mesagess: [Mesages],
    store: { type: Boolean, default: false },
    share: { type: Boolean, default: false }
  },
  { timestamps: true }
);

Conversation.pre('save', function () {});
export default mongoose.model('Conversation', Conversation);
