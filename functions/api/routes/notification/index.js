const express = require('express');
const { checkUser } = require('../../../middlewares/auth');
const router = express.Router();

router.get('/', checkUser, require('./myNotificationGET'));
router.post('//button', checkUser, require('./myNotificationButtonPOST'));

module.exports = router;
