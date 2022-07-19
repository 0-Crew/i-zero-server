const express = require('express');
const router = express.Router();

// '/user' 이하의 경로로 들어온 요청은 모두 user 폴더 안에서 처리
router.use('/auth', require('./auth'));
router.use('/user', require('./user'));
router.use('/my-challenge', require('./myChallenge'));
router.use('/my-inconvenience', require('./myInconvenience'));
router.use('/bottleworld', require('./bottleworld'));
router.use('/notification', require('./notification'));
router.use('/my-notification', require('./myNotification'));

module.exports = router;
