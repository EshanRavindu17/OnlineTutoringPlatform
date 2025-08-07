// routes/userRoutes.js
import express from 'express';
import { getUserByUid, addUser, checkRole } from '../controllers/userController.js'; // add .js

const router = express.Router();

router.get('/user/:uid', getUserByUid);
router.post('/add-user', addUser);
router.post('/check-role', checkRole);

export default router;
