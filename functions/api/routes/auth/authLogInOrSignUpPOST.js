const functions = require('firebase-functions');
const admin = require('firebase-admin');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB } = require('../../../db');
const jwtHandlers = require('../../../lib/jwtHandlers');
const { appleAuth, kakaoAuth } = require('../../../lib/OAuth');
const { firebaseAuth } = require('../../../config/firebaseClient');
const { signInWithEmailAndPassword } = require('firebase/auth');
const jwt = require('jsonwebtoken');

/*
1. 클라이언트로부터 sns_id (소셜로그인 후 받은 값), email (소셜로그인 후 받은 이메일), provider (어떤 sns인지??) 를 받는다
2. sns_id, provider로 가입된 유저인지 아닌지 파악한다
2-1. 이미 가입된 유저라면 3으로 넘어간다.
2-2. 처음 접근하는 유저라면 RDS DB에 유저 데이터를 저장한다
3. accesstoken을 발급한다.
4. 발급된 토큰을 들고 신나게 춤춘다.
*/

module.exports = async (req, res) => {
  const { token, idKey, provider, authorizationCode } = req.body;
  if (!token || !idKey || !provider) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  let client;
  client = await db.connect(req);
  try {
    let user;
    let email;
    let type;

    switch (provider.toLowerCase()) {
      case 'apple':
        const appleUser = await appleAuth(token);
        if (appleUser.email) email = appleUser.email;
        break;

      case 'kakao':
        const kakaoUser = await kakaoAuth(token);
        if (!kakaoUser) return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER_SOCIAL));

        if (kakaoUser === responseMessage.NOT_INCLUDE_EMAIL) email = null;
        if (kakaoUser === responseMessage.INVALID_USER) res.status(statusCode.UNAUTHORIZED).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.UNAUTHORIZED_SOCIAL));

        email = kakaoUser.email;
        break;

      case process.env.TEST_CASE:
        email = token;
        break;
    }

    const checkedUser = await userDB.getUserBySnsIdAndProvider(client, idKey, provider);
    // 계정이 없는 경우! -> 회원가입을 시켜야한다.
    if (!checkedUser || !checkedUser.name) {
      type = 'signUp';

      //RDS DB에 유저를 생성한다
      user = await userDB.addUser(client, email || null, idKey, provider, authorizationCode || null);
    } else {
      type = 'login';
      user = checkedUser;
    }

    // JWT access token 발급
    const accesstoken = jwtHandlers.sign(user);
    // JWT refresh token 발급
    const refreshtoken = jwtHandlers.refresh({ snsId: idKey, provider });

    await userDB.setRefreshToken(client, user.id, refreshtoken);
    res.status(statusCode.OK).send(util.success(statusCode.OK, type == 'login' ? responseMessage.LOGIN_SUCCESS : responseMessage.CREATED_USER, { type, accesstoken, refreshtoken }));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
