const express = require('express');
const { checkUser } = require('../../../middlewares/auth');
const router = express.Router();

router.post('/', checkUser, require('./bottleworldFollowUnfallowPOST'));
router.get('/filter', checkUser, require('./bottleworldFilterGET'));
module.exports = router;
