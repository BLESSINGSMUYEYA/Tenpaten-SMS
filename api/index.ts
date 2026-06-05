import app from '../apps/api/src/app';
import { connectDatabase } from '../apps/api/src/config/database';

let isDbConnected = false;

export default async (req: any, res: any) => {
  // Establish database connection on first serverless invocation
  if (!isDbConnected) {
    try {
      await connectDatabase();
      isDbConnected = true;
    } catch (error) {
      console.error('❌ Database connection failed in serverless function:', error);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }

  // Forward request to Express app
  return app(req, res);
};
