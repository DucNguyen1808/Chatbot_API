import mongoose from 'mongoose';

const Iframe = new mongoose.Schema(
  {
    domain_name: { type: String, require: true },
    name: { type: String, require: true },
    header_color: { type: String, require: true },
    header_text_color: { type: String, require: true },
    body_color: { type: String, require: true },
    mbox_color: { type: String, require: true },
    mbox_text_color: { type: String, require: true },
    icon: { type: String, require: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);
export default mongoose.model('Iframe', Iframe);
