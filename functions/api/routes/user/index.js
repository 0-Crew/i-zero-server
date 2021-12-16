const express = require('express');
const { checkUser } = require('../../../middlewares/auth');
const router = express.Router();

router.get('/test', require('./testGET'));
router.post('/name', checkUser, require('./userSetNamePOST'));
router.get('/private', checkUser, require('./userPrivateGET'));

module.exports = router;
