const express = require('express');
const contractController = require('../controllers/contractController');

const router = express.Router();

router.get('/:id', contractController.getContract);

module.exports = router;