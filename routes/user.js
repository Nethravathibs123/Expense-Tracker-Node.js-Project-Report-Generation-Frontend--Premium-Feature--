

const express = require('express');

const adminController = require('../controllers/user');

const router = express.Router();

router.post('/signup', adminController.postAddUsers);

router.post('/login', adminController.postLogin);

module.exports = router;
