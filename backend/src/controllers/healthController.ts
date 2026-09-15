import { Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse';

export const getHealthStatus = (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Academia Industry Portal API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
};
