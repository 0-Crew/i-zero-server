const express = require('express');
const { checkUser } = require('../../../middlewares/auth');
const router = express.Router();

router.get('/', checkUser, require('./myNotificationGET'));

module.exports = router;
