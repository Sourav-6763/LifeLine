import { type } from '@react-native-firebase/app/dist/module/internal/web/firebaseFirestorePipelines';
import mongoose from 'mongoose';
const bloodRequestSchema = mongoose.Schema(
  {
    bloodGroup: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    place: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'cancelled'],
      default: 'pending',
    },
    urgency: {
      type: String,
      default: 'medium',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);
const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);
export default BloodRequest;
