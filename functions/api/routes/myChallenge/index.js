const express = require('express');
const { checkUser } = require('../../../middlewares/auth');
const router = express.Router();

router.post('/add', checkUser, require('./myChallengeAddPOST'));
router.get('/add', checkUser, require('./myChallengeAddGET'));
router.get('/main', checkUser, require('./myChallengeMainGET'));
router.get('/user', checkUser, require('./myChallengeUserGET'));

router.get('/calendar', checkUser, require('./myChallengeCalendarGET'));

module.exports = router;
