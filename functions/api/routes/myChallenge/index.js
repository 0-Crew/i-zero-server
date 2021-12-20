const express = require('express');
const { checkUser } = require('../../../middlewares/auth');
const router = express.Router();

router.post('/add', checkUser, require('./myChallengeAddPOST'));
router.get('/add', checkUser, require('./myChallengeAddGET'));

module.exports = router;
