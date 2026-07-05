import { messaging } from '../config/fireBaseDb.js';
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
    const tokenUserId = req.userIdData.data;
    const {userId}=req.body;
    const data = await User.findOne({userId:userId}).select('fcmToken');
    console.log("Donor token:", data.fcmToken);
    // console.log(data);
        // async function sendNotification(fcmToken, body, heading) {
      // if (!body || !heading) {
      //   console.log('❌ Skip sending empty notification');
      //   return;
      // }
      // console.log("hi");
      try {
        await messaging.send({
          token: data.fcmToken,
          data: {
            type: 'birthday',
            title: "hi", // ✅ same
            body:"hello",
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
            headers: {'apns-priority': '10'},
            // payload: {
            //   aps: {alert: {title: heading, body}, sound: 'default', badge: 1},
            // },
          },
        });
        console.log('✅ Notification sent');
        // return true;
      } catch (err) {
        console.error('❌ Error sending notification', err.code || err.message);

        // return false;
      }
    

    return successResponse(res, null, 200, 'Request received');
  } catch (error) {
    console.log(error);
    return errorResponse(res, null, 500, 'Server Error');
  }
};
