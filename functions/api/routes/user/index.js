const express = require('express');
const { checkUser } = require('../../../middlewares/auth');
const router = express.Router();

router.post('/name', checkUser, require('./userSetNamePOST'));
router.get('/private', checkUser, require('./userPrivateGET'));
router.put('/private', checkUser, require('./userPrivateTogglePUT'));
router.get('/setting', checkUser, require('./userSettingGET'));

module.exports = router;
