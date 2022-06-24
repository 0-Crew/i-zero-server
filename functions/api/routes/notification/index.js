const express = require('express');
const { checkUser } = require('../../../middlewares/auth');
const router = express.Router();

router.get('/notification', checkUser, require('./myNotificationGET'));
router.post('/notification/button', checkUser, require('./myNotificationButtonPOST'));

module.exports = router;
