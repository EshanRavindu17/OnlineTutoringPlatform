import express from 'express';
import { getZoomZakController } from '../controllers/zoom.controller';
import { verifyFirebaseTokenSimple } from '../middleware/authMiddlewareSimple';

const router = express.Router();

router.post('/get-zak', verifyFirebaseTokenSimple, getZoomZakController);

export default router