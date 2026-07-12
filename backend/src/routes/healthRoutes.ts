import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Nexus backend is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
