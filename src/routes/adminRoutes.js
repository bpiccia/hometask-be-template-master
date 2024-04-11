const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/best-profession', adminController.getBestProfession);
router.get('/best-clients', adminController.getBestClients);

module.exports = router;