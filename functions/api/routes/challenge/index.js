const express = require('express');
const { checkUser } = require('../../../middlewares/auth');
const router = express.Router();

router.post('/add', checkUser, require('./challengeAddPOST'));

module.exports = router;
