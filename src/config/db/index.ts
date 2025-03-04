import mongoose from 'mongoose';
export const connectMongoDB = async () => {
  try {
    const uri: string = process.env.MONGO_URI || '';
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.log('Error connecting to MongoDB', error);
  }
};
