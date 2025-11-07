
const express = require('express');
const router = express.Router();
const { getMe, updateMe } = require('../controllers/userController');
const auth = require('../middlewares/auth');

// @route   GET api/users/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, getMe);

// @route   PUT api/users/me
// @desc    Update current user's profile
// @access  Private
router.put('/me', auth, updateMe);

module.exports = router;
