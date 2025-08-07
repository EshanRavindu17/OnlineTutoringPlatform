// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getUserByUid, addUser, checkRole } = require('../controllers/userController');

router.get('/user/:uid', getUserByUid);
router.post('/add-user', addUser);
router.post('/check-role', checkRole);

module.exports = router;
