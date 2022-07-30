const express = require('express');
const { checkUser } = require('../../../middlewares/auth');
const router = express.Router();

router.post('/add', checkUser, require('./myChallengeAddPOST'));
router.get('/add', checkUser, require('./myChallengeAddGET'));
router.get('/main', checkUser, require('./myChallengeMainGET'));
router.get('/user', checkUser, require('./myChallengeUserGET'));
router.get('/user/calendar', checkUser, require('./myChallengeUserCalendarGET'));

router.get('/calendar', checkUser, require('./myChallengeCalendarGET'));
router.put('/main', checkUser, require('./myChallengeFinishPUT'));

module.exports = router;
