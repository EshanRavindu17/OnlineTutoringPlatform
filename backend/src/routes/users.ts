import { Router } from 'express';
import { getUserByUid, addUser, checkRole, getUsers } from '../controllers/userController';

const router = Router();
router.get('/users', getUsers);
router.get('/users/:uid', getUserByUid);
router.post('/users', addUser);
router.post('/users/check-role', checkRole);

module.exports = router;
