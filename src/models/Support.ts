import mongoose from 'mongoose';

const supportSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    attachments: {
      type: String, // Nếu muốn hỗ trợ nhiều file, có thể dùng [String]
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'resolved'], // hoặc tự định nghĩa thêm
      default: 'pending'
    },
    priority: {
      type: Number,
      enum: [1, 2, 3], // 1 = cao, 2 = trung bình, 3 = thấp
      default: 2
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
