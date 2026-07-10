import { messaging } from '../config/fireBaseDb.js';
import DonorRequest from '../models/DonorRequestModel.js';
import User from '../models/UserModel.js';
import {
  errorResponse,
  successResponse,
} from '../utils/errorSuccessResponse.js';

export const bloodSearchFunc = async (req, res) => {
  const { lat, lon, radius, search } = req.body;
  const KMradious = radius * 1000;

  try {
    if (!lat || !lon) {
      return errorResponse(res, null, 400, 'Location required');
    }

    const donors = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lon, lat],
          },
          query: {
            isDonor: true,
            isAvailable: true,
            'donorInfo.bloodGroup': search,
          },
          distanceField: 'distance',
          maxDistance: KMradious,
          spherical: true,
        },
      },
      {
        $addFields: {
          distanceInKm: { $divide: ['$distance', 1000] }, // 🔥 meter → km
        },
      },
    ]);
    return successResponse(res, donors, 200, 'Nearby donors found');
  } catch (error) {
    console.log('ERROR:', error);
    return errorResponse(res, null, 500, 'Server Error');
  }
};

export const donorRequestForBloodController = async (req, res) => {
  try {
    const UserId = req.userIdData.data;
    const { DonorUserId } = req.body;
    const donorReq = await User.findOne({ userId: DonorUserId });
    const currentuser = await User.findOne({ userId: UserId });

    // console.log('Donor token:', donorReq);
    if (UserId != currentuser.userId) {
      return errorResponse(res, null, 400, 'User Not Found');
    }

    const existingRequest = await DonorRequest.findOne({
      senderId: currentuser._id,
      receiverId: donorReq._id,
      status: 'pending',
    });

    if (existingRequest) {
      return errorResponse(res, null, 400, 'Request already sent');
    }

    await DonorRequest.create({
      senderId: currentuser._id,
      receiverId: donorReq._id,
      status: 'pending',
    });
    try {
      await messaging.send({
        token: donorReq.fcmToken,
        data: {
          type: 'birthday',
          title: 'Blood Request 🩸',
          body: `${currentuser.fullName} needs your help. Please consider donating blood.`,
          id: Date.now().toString(),
        },
        android: {
          priority: 'high',
          // notification: {
          //   priority: 'max',
          // },
          ttl: 1000 * 60 * 60 * 24,
        },
        apns: {
          headers: { 'apns-priority': '10' },
        },
      });
      console.log('✅ Notification sent');
      return successResponse(res, null, 200, 'Request sent successfully');
      // return true;
    } catch (err) {
      return errorResponse(res, null, 500, 'Donor unable to take request');
      console.error('❌ Error sending notification', err.code || err.message);

      // return false;
    }
  } catch (error) {
    console.log(error);
    return errorResponse(res, null, 500, 'Server Error');
  }
};

// controllers/donorController.js


export const getNearbyDonors = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Location required' });
    }

    const donors = await User.find({
      isDonor: true,
      isAvailable: true,
      'donorInfo.location': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: 500000, // 🔥 500km radius
        },
      },
    })
      .limit(50);
// console.log(donors);
    res.json({ success: true, donors });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server Error' });
  }
};