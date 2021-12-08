const express = require('express');
const { checkUser } = require('../../../middlewares/auth');
const router = express.Router();

router.post('/add', checkUser, require('./challengeAddPOST'));
router.get('/add', checkUser, require('./challengeAddGET'));

module.exports = router;
