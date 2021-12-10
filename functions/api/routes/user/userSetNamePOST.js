const functions = require('firebase-functions');
const admin = require('firebase-admin');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB } = require('../../../db');
const jwtHandlers = require('../../../lib/jwtHandlers');

/*
1. 클라이언트로부터 유저의 name을 받는다
2. 중복된 값이 있나 확인.
2-1. 중복된 값이 있다면 error 처리
2-2. 중복된 값이 없다면 해당 유저의 name을 설정한다.
*/

module.exports = async (req, res) => {
  const { name } = req.body;
  const user = req.user;

  if (!name) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);
    const isExistName = await userDB.checkUserName(client, name);
    if (isExistName) {
      return res.status(statusCode.NO_CONTENT).json(util.fail(statusCode.NO_CONTENT, '해당 이름을 가진 유저가 이미 있습니다.'));
    } else {
      const setName = await userDB.setUserName(client, name, user.id);
      console.log('setName : ', setName);
    }
    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SET_USER_NAME_SUCCESS));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
