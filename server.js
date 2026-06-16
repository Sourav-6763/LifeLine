import express from 'express';
import dotenv from 'dotenv';

import { successResponse } from './utils/errorSuccessResponse.js';
import userRoute from './routes/userRoutes.js';
import bloodSearchRoute from './routes/bloodSearchRoute.js'
import connectDB from './config/mongoDbConnect.js';
import dns from 'dns';
dns.setServers(['1.1.1.1', '8.8.8.8']);
dotenv.config();
const app = express();

await connectDB();

app.use(express.json());
// app.use('/donor', userRoute);
app.use('/user',userRoute);
app.use('/blood',bloodSearchRoute);

// app.get('/test', (req, res) => {
//   successResponse(req, res, 'hi i am', 500);
// });

app.listen(5000, () => {
  console.log('Server started');
});
