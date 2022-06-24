const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { myNotificationDB, userDB } = require('../../../db');
const e = require('cors');

/*
1. 클라이언트로부터 토큰을 받아 유저의 id를 받고, body를 통해 해당 유저가 팔로우 할 유저의 id를 받아온다.
2. 해당 row 를 찾아 없다면 생성 
3. row가 이미 존재한다면 있다면 is_deleted를 토글한다. (is_deleated가 true = 언팔로우 상태, false = 팔로잉 상태) 
*/

module.exports = async (req, res) => {
  // type은 'congrats'또는 'cheer'로 받는다!
  const { type, receiverUserId } = req.query;
  const user = req.user;

  if (!type || !receiverUserId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  let client;

  try {
    client = await db.connect(req);

    // 유효한 유저인지 확인
    const checkedUser = await userDB.getUserById(client, receiverUserId);
    if (!checkedUser) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.INVALID_USER));
    }

    // 입력받은 type에 따라, myNotification에 들어갈 notification_id를 정해준다
    // 5는 축하하기, 6은 응원하기
    let notiType;
    if (type === 'congrats') {
      notiType = 5;
    } else if (type === 'cheer') {
      notiType = 6;
    } else {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.INVALID_BUTTON_TYPE));
    }
    await client.query('BEGIN');

    await myNotificationDB.addButtonNotification(client, user.id, receiverUserId, notiType);
    await client.query('COMMIT');

    return res.status(statusCode.OK).send(util.success(statusCode.OK, notiType === 5 ? responseMessage.CONGRATS_SUCCESS : responseMessage.CHEER_SUCCESS));
  } catch (error) {
    // 서버 에러시 500 return
    await client.query('ROLLBACK');
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
