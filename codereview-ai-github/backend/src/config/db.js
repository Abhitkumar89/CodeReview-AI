import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

export async function connectDB() {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    // eslint-disable-next-line no-console
    console.log(`[db] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[db] MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}
