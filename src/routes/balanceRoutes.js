const express = require('express');
const profileController = require('../controllers/profileController');
const getProfile = require ('../middleware/getProfile')

const router = express.Router();

// Below this line, user must be authenticated
router.post('/deposit/:userId', getProfile.getProfile, profileController.addBalance);

module.exports = router;