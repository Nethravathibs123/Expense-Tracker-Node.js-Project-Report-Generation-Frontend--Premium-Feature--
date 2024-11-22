const path = require('path');

const express = require('express');

const premiumFeatureControllers = require('../controllers/premium');

const userauthenticate = require('../middleware/auth')

const router = express.Router();

router.get('/showLeaderBoard', userauthenticate, premiumFeatureControllers.getUserLeaderBoard);

module.exports = router;