const functions = require('firebase-functions');
const admin = require('firebase-admin');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB } = require('../../../db');
const jwtHandlers = require('../../../lib/jwtHandlers');

/*
1. 클라이언트로부터 sns_id (소셜로그인 후 받은 값), email (소셜로그인 후 받은 이메일), provider (어떤 sns인지??) 를 받는다
2. 값이 있나 확인후, 해당 값들을 확인해서 가입된 유저인지 아닌지 파악한다
2-1. 이미 가입된 유저라면 3으로 넘어간다.
2-2. 처음 접근하는 유저라면 Firebase Authentication에 유저를 생성하고, RDS DB에도 유저 데이터를 저장한다
3. idFirebase가 담긴 accesstoken을 발급한다.
4. 발급된 토큰을 들고 신나게 춤춘다.
*/

module.exports = async (req, res) => {
  const { email, sns_id, provider } = req.body;

  if (!email || !sns_id || !provider) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    // Firebase Authentication을 통해 유저를 생성!!
    const userFirebase = await admin
      .auth()
      .createUser({ email })
      .then((user) => user)
      .catch((e) => {
        console.log(e);
        return { err: true, error: e };
      });

    if (userFirebase.err) {
      if (userFirebase.error.code === 'auth/email-already-exists') {
        return res.status(statusCode.NOT_FOUND).json(util.fail(statusCode.NOT_FOUND, '해당 이메일을 가진 유저가 이미 있습니다.'));
      } else {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
      }
    }

    //RDS DB에 유저를 생성한다
    const idFirebase = userFirebase.uid;
    const user = await userDB.addUser(client, email, sns_id, provider, idFirebase);

    // JWT access token 발급
    const { accesstoken } = jwtHandlers.sign(user.idFirebase);

    res.status(statusCode.OK).send(
      util.success(statusCode.OK, responseMessage.READ_USER_SUCCESS, {
        exist,
      }),
    );
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
