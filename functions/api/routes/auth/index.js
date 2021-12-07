const express = require('express');
const router = express.Router();

router.post('/', require('./authLogInOrSignUpPOST'));

module.exports = router;
