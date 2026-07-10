import DonorRequest from '../models/DonorRequestModel.js';
import User from '../models/UserModel.js';
import {
  errorResponse,
  successResponse,
} from '../utils/errorSuccessResponse.js';
import { jsonwebTokenCoded } from '../utils/jsonwebToken.js';

export const donorRegistration = async (req, res) => {
  try {
    const userId = req.userIdData.data;

    // 🔥 THIS WAS MISSING
    const {
      age,
      gender,
      fullName,
      place,
      weight,
      selectedBlood,
      phoneNumber,
      disease,
      lat,
      lon,
      isAvailable,
    } = req.body;
    const existingUser = await User.findOne({ userId });

    if (existingUser?.isUserRegistered) {
      return errorResponse(res, null, 400, 'Already registered');
    }

    await User.updateOne(
      { userId },
      {
        fullName,
        place,
        donorInfo: {
          phoneNumber,
          age,
          gender,
          location: {
            type: 'Point',
            coordinates: [lon, lat], // 🔥 IMPORTANT
          },
          weight,
          bloodGroup: selectedBlood, // 🔥 fix name
          disease,
        },
        isUserRegistered: true,
        isDonor: true,
        isAvailable,
      },
    );

    return successResponse(res, null, 200, 'Registration success');
  } catch (error) {
    console.log('ERROR:', error);
    return errorResponse(res, null, 500, 'Server Error');
  }
};

export const userInfo = async (req, res) => {
  const { email, userId, fcmToken } = req.body;
  // console.log("fcm",fcmToken);
  try {
    if (!email || !userId) {
      return errorResponse(res, null, 400, 'please again login');
    }

    const user = await User.findOne({ userId });

    if (user) {
      // ✅ update FCM token
      user.fcmToken = fcmToken;
      await user.save();

      const token = jsonwebTokenCoded({
        data: user.userId,
        days: '7d',
      });

      return successResponse(res, token, 200, 'Welcome back');
    }

    // ✅ new user
    const newUser = await User.create({
      email,
      userId,
      fcmToken,
    });

    const token = jsonwebTokenCoded({
      data: newUser.userId,
      days: '7d',
    });

    return successResponse(res, token, 200, 'Login successful');
  } catch (error) {
    console.log(error);
  }
};
export const getProfile = async (req, res) => {
  try {
    const userId = req.userIdData.data;
    const user = await User.findOne({ userId });
    const completedDonation = await DonorRequest.countDocuments({
      receiverId: user._id,
      status: 'completed',
    });
    if (!user) {
      return errorResponse(res, null, 404, 'User not found');
    }
    return successResponse(
      res,
      {
        isUserRegistered: user.isUserRegistered,
        isDonor: user.isDonor,
        completedDonation,
      },
      200,
      'Profile data',
    );
  } catch (error) {
    return errorResponse(res, null, 500, 'Server error');
  }
};
export const updateFcmTokenHandaler = async (req, res) => {
  try {
    const userId = req.userIdData.data;
    const { newToken } = req.body;

    if (!newToken) {
      return res.status(400).json({ message: 'Token missing' });
    }

    const user = await User.findOneAndUpdate(
      { userId: userId },
      { fcmToken: newToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'FCM token updated',
      token: user.fcmToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
};
