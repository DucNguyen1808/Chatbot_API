import mongoose from 'mongoose';

const supportSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    attachment: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'resolved'],
      default: 'pending'
    },
    priority: {
      type: Number,
      enum: [1, 2, 3],
      default: 1
    },
    response: {
      type: String,
      default: ''
    },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: true // Tự động tạo createdAt và updatedAt
  }
);

const Support = mongoose.model('Support', supportSchema);
export default Support;
