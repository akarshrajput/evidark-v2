import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    required: true,
    enum: ['Story', 'Comment']
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  }
}, {
  timestamps: true
});

// Compound index to ensure one like per user per target
likeSchema.index({ user: 1, target: 1, targetType: 1 }, { unique: true });
likeSchema.index({ target: 1, targetType: 1 });

export default mongoose.model('Like', likeSchema);
