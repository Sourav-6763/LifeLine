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
  const { email, userId } = req.body;
  
  try {
    if (!email || !userId) {
      return errorResponse(res, null, 400, 'please again login');
    }

    const user = await User.findOne({ userId });
    // console.log(user.userId);
    if (user) {
      //  const token = jsonwebTokenCoded({
      //   data: user.userId,
      //   days: '7d',
      // });

      // return successResponse(res, { userId: user.userId, token }, 200, 'Welcome back');
      const token = jsonwebTokenCoded({ data: user.userId, days: '7d' });
      return successResponse(res, token, 200, 'Welcome back');
    }

    const newUser = await User.create({ email, userId });
    const token = jsonwebTokenCoded({ data: newUser.userId, days: '7d' });
    return successResponse(res, token, 200, 'Login successful');
  } catch (error) {
    console.log(error);
  }
};
export const getProfile = async (req, res) => {
  try {
    const userId = req.userIdData.data;
    const user = await User.findOne({ userId });
    if (!user) {
      return errorResponse(res, null, 404, 'User not found');
    }

    return successResponse(
      res,
      {
        isUserRegistered: user.isUserRegistered,
        isDonor: user.isDonor,
      },
      200,
      'Profile data',
    );
  } catch (error) {
    return errorResponse(res, null, 500, 'Server error');
  }
};
