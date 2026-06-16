export const successResponse = (res, payload = null, statusCode = 200, message = "Success") => {
  res.status(statusCode).json({
    success: true,
    message,
    data: payload
  });
};

export const errorResponse = (res, payload = null, statusCode = 400, message = "Error") => {
   res.status(statusCode).json({
    success: false,
    message,
    data: payload
  });
};