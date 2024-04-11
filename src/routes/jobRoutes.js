const express = require('express');
const jobController = require('../controllers/jobController');
const getProfile = require ('../middleware/getProfile')

const router = express.Router();

// Below this line, user must be authenticated
router.get('/unpaid', getProfile.getProfile, jobController.getUnpaidJobs);
router.post('/:job_id/pay', getProfile.getProfile, jobController.payJob);

module.exports = router;

// **_POST_** `/jobs/:job_id/pay` - Pay for a job, a client can only pay if his balance >= the amount to pay. The amount should be moved from the client's balance to the contractor balance.