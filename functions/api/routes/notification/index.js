const express = require('express');
const { checkUser } = require('../../../middlewares/auth');
const router = express.Router();

router.get('/notification', checkUser, require('./myNotificationGET'));

module.exports = router;
