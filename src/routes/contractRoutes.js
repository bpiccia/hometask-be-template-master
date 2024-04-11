const express = require('express');
const contractController = require('../controllers/contractController');
const getProfile = require ('../middleware/getProfile')

const router = express.Router();

// Below this line, user must be authenticated
router.get('/', getProfile.getProfile, contractController.getNonTerminatedContracts);
router.get('/:id', getProfile.getProfile, contractController.getContract);

module.exports = router;