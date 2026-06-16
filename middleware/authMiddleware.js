import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/errorSuccessResponse.js';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  if (!token) {
    return errorResponse(res, null, 400, 'no token found');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userIdData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
