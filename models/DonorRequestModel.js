import mongoose from 'mongoose';

const donorRequestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // requestPostId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'BloodRequest', // optional link
    // },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    message: {
      type: String,
      default: 'Blood request received',
    },
  },
  { timestamps: true },
);

const DonorRequest =
  mongoose.models.DonorRequest ||
  mongoose.model('DonorRequest', donorRequestSchema);

export default DonorRequest;
