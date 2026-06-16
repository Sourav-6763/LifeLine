import User from '../models/userModel.js';
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
          distanceField: 'distance',
          maxDistance: KMradious,
          spherical: true,
        },
      },
      {
        $match: { isDonor: true },
      },
      {
        $match: { isAvailable: true },
      },
      { $match: { 'donorInfo.bloodGroup': search } },
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
