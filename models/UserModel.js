import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Firebase UID
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
    },

    fullName: {
      type: String,
      trim: true,
    },

    // 🔥 status flags
    isUserRegistered: {
      type: Boolean,
      default: false,
    },

    isDonor: {
      type: Boolean,
      default: false,
    },

    isReceiver: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    place: {
      type: String,
    },
    // 🔥 donor info (nested object)
    donorInfo: {
      phoneNumber: String,
      age: Number,
      gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
      },
      location: {
        type: {
          type: String,
          enum: ['Point'],
        },
        coordinates: {
          type: [Number],
        },
      },
      weight: Number,
      bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      },
      disease: {
        type: String,
        default: 'None',
      },
    },
  },
  {
    timestamps: true,
  },
);
userSchema.index({ 'donorInfo.location': '2dsphere' }, { sparse: true });
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
