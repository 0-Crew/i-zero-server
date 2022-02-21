const express = require('express');
const { checkUser } = require('../../../middlewares/auth');
const router = express.Router();

router.post('/', checkUser, require('./bottleworldFollowUnfallowPOST'));
router.get('/filter', checkUser, require('./bottleworldFilterGET'));
router.get('/follower', checkUser, require('./bottleworldFollowerGET'));
router.get('/following', checkUser, require('./bottleworldFollowingGET'));
router.get('/browse', checkUser, require('./bottleworldBrowseGET'));

module.exports = router;
