const functions = require('firebase-functions');
const admin = require('firebase-admin');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB } = require('../../../db');
const jwtHandlers = require('../../../lib/jwtHandlers');

/*
1. 클라이언트로부터 유저의 id을 받는다
2. 해당 id를 가진 유저의 둘러보기 공개 여부 조회
3. 조회된 결과를 toggle하여 db 업데이트
*/

module.exports = async (req, res) => {
  const user = req.user;

  let client;

  try {
    client = await db.connect(req);

    const isPrivate = await userDB.checkUserPrivate(client, user.idFirebase);

    if (!isPrivate) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER));
    }
    isPrivate.isPrivate = !isPrivate.isPrivate;
    const togglePrivate = await userDB.toggleUserPrivate(client, isPrivate.isPrivate, user.idFirebase);

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.TOGGLE_USER_PRIVATE, isPrivate));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
