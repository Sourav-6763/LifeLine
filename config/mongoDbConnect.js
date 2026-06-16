import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL, { dbName: 'LifeLine' });
    console.log('MongoDB Connected ✅');
  } catch (error) {
    console.log('MongoDB Error ❌', error);
  }
};

export default connectDB;
