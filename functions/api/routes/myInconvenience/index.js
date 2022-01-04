const express = require('express');
const { checkUser } = require('../../../middlewares/auth');
const router = express.Router();

router.put('/finish', checkUser, require('./myInconvenienceFinishTogglePUT'));
router.put('/update', checkUser, require('./myInconvenienceUpdatePUT'));

module.exports = router;
