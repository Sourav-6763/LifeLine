import { db, messaging } from '../config/fireBaseDb.js';
import BloodRequest from '../models/BloodRequestModel.js';
import DonorRequest from '../models/DonorRequestModel.js';
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
          maxDistance: 50000,
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

export const getDonorRequestDataController = async (req, res) => {
  try {
    const userId = req.userIdData.data;

    const user = await User.findOne({ userId });

    if (!user) {
      return errorResponse(res, null, 404, 'User not found');
    }

    // 🔥 all requests
    const data = await DonorRequest.find({
      receiverId: user._id,
    })
      .populate('senderId', 'fullName donorInfo place')
      .sort({ createdAt: -1 });

    // 🔥 counts (BEST WAY)
    // const total = requests.length;
    const accepted = data.filter(r => r.status === 'accepted').length;
    const donated = data.filter(r => r.status === 'completed').length;
    const requests = data.filter(r => r.status === 'pending').length;
    return successResponse(
      res,
      {
        data,
        accepted,
        donated,
        requests,
      },
      200,
      'Requests fetched',
    );
  } catch (error) {
    console.log(error);
    return errorResponse(res, null, 500, 'Server Error');
  }
};

export const donorAcceptRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const donorUserId = req.userIdData.data; // logged in donor
    // 🔍 Find request
    const request = await DonorRequest.findById(requestId).populate('senderId');
    // console.log(request);
    // // ✅ update status
    request.status = 'accepted';
    request.acceptedBy = donorUserId;
    await request.save();
    const request2 = await DonorRequest.findById(requestId).populate(
      'receiverId',
    );
    // console.log(request2);
    // // 🔔 OPTIONAL: Send notification to sender
    // const sender = await User.findOne({ userId: donorUserId });

    if (sender?.fcmToken) {
      const message = {
        token: request2.fcmToken,
        data: {
          title: 'Blood Request Accepted 🩸',
          body: `${sender.fullName} has accepted your blood request.`,
        },
        // data: {
        //   type: 'ACCEPT_REQUEST',
        //   requestId: requestId.toString(),
        // },
      };

      await messaging.send(message);
    }

    return successResponse(res, null, 200, 'Request accepted successfully');
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
};

export const getReciverRequestDataController = async (req, res) => {
  try {
    const userId = req.userIdData.data;

    const user = await User.findOne({ userId });

    if (!user) {
      return errorResponse(res, null, 404, 'User not found');
    }
    // console.log(user);
    // // 🔥 all requests
    const data = await DonorRequest.find({
      senderId: user._id,
    })
      .populate('receiverId', 'fullName donorInfo place')
      .sort({ createdAt: -1 });

    let formattedData = [];

    data.forEach(item => {
      if (item.status === 'pending') {
        formattedData.push({
          _id: item._id,
          blood: item.receiverId?.donorInfo?.bloodGroup,
          location: item.receiverId?.place,
          status: item.status,
          createdAt: item.createdAt,
        });
      } else {
        formattedData.push(item);
      }
    });

    // console.log(formattedData);
    // // 🔥 counts (BEST WAY)
    // // const total = requests.length;
    // const accepted = data.filter(r => r.status === 'accepted').length;
    // const donated = data.filter(r => r.status === 'completed').length;
    // const requests = data.filter(r => r.status === 'pending').length;
    // console.log(data);
    return successResponse(
      res,
      {
        formattedData,
      },
      200,
      'Requests fetched',
    );
  } catch (error) {
    console.log(error);
    return errorResponse(res, null, 500, 'Server Error');
  }
};
