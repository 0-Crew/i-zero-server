const express = require('express');
const router = express.Router();

router.get('/test', require('./testGET'));
router.post('/name', require('./userSetNamePOST'));

module.exports = router;
