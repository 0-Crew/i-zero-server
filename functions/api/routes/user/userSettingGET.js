const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB } = require('../../../db');
const jwtHandlers = require('../../../lib/jwtHandlers');

module.exports = async (req, res) => {
  const user = req.user;

  let client;

  try {
    client = await db.connect(req);
    let result = { user: { id: user.id, name: user.name, isPrivate: user.isPrivate } };

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_USER_FOR_SETTING, result));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
