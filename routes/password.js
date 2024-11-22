const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/password');

router.post('/forgotpassword', passwordController.forgotpassword);
router.get('/updatepassword/:resetpasswordid', passwordController.updatepassword)

router.get('/resetpassword/:id', passwordController.resetpassword)


module.exports = router;