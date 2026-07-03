import { db, messaging } from '../config/fireBaseDb.js';
import BloodRequest from '../models/BloodRequestModel.js';
import User from '../models/UserModel.js';
import {
  errorResponse,
  successResponse,
} from '../utils/errorSuccessResponse.js';

export const bloodRequestPost = async (req, res) => {
  try {
    const { bloodGroup, contact, message, place, lat, lon } = req.body;

    const userId = req.userIdData.data;

    const user = await User.findOne({ userId }).select('_id');

    if (!user) {
      return errorResponse(res, null, 400, 'User not found');
    }

    const newRequest = await BloodRequest.create({
      bloodGroup,
      contact,
      message,
      place,
      location: {
        type: 'Point',
        coordinates: [lon, lat],
      },
      postedBy: user._id,
    });

    // ✅ Define title & body
    const title = 'Blood Needed 🩸';
    const body = `${bloodGroup} blood required at ${place}`;

    // ✅ Dynamic topic (BEST PRACTICE)
    const topic = `blood_${bloodGroup}`;
    await messaging.send({
      topic: 'BloodPost',
      notification: {
        title,
        body,
      },
      data: {
        title,
        body,
        type: 'blood_request',
      },
    });
    return successResponse(
      res,
      newRequest,
      201,
      'Blood request created successfully',
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, null, 500, error.message);
  }
};

export const SeeAllbloodRequestPost = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    console.log('LAT:', lat, 'LON:', lon);
    const data = await BloodRequest.aggregate([
      {
        $geoNear: {
          key: 'location',
          near: {
            type: 'Point',
            coordinates: [parseFloat(lon), parseFloat(lat)],
          },
          distanceField: 'distance',
          spherical: true,
          maxDistance: 5000,
        },
      },
      {
        $addFields: {
          distanceInKM: { $divide: ['$distance', 1000] },
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    console.log(data);
    // const data = await BloodRequest.find()
    //   .sort({ createdAt: -1 })
    //   .skip(skip)
    //   .limit(limit);
    const total = await BloodRequest.countDocuments();

    return successResponse(
      res,
      {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      200,
      'Blood requests fetched successfully',
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, null, 500, error.message);
  }
};
