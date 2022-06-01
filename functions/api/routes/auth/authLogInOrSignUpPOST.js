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
  const { token, idKey, provider } = req.body;
  if (!token || !idKey || !provider) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  let client;
  try {
    client = await db.connect(req);

    let loginSuccess;
    let idFirebase;
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

    // const appleAccessToken =
    //   'eyJraWQiOiJlWGF1bm1MIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiYXVkIjoiY29tLnRlYW1aZXJvLldZQiIsImV4cCI6MTY0NTYzMDIyMSwiaWF0IjoxNjQ1NTQzODIxLCJzdWIiOiIwMDA2ODQuZjg1OTBhZTczN2Q3NGZhNWFkNGE1MTIwYjA0MzI5OTEuMTcxOCIsImNfaGFzaCI6Ii1lS3E3eHJOR2c5enBEMHRJYTJVRFEiLCJlbWFpbCI6Ink0dXJ0aWpuZmpAcHJpdmF0ZXJlbGF5LmFwcGxlaWQuY29tIiwiZW1haWxfdmVyaWZpZWQiOiJ0cnVlIiwiaXNfcHJpdmF0ZV9lbWFpbCI6InRydWUiLCJhdXRoX3RpbWUiOjE2NDU1NDM4MjEsIm5vbmNlX3N1cHBvcnRlZCI6dHJ1ZX0.kBFV4_sOkk8htweZv-A9VEBs9bWMYYuYeBeBAr1KR1ToMHxG5Ph9vGCigf0S8TUujJIN0mYI0HYY7SDpabx0uNGCip40hGclt0n6FlcYXe5J6SxeXETeznAYJrPGRs6qAowk8fbZozMK0h5xMSrmGiZLwW6CXpoYpvRvOjacx1RbxNfcjchwjF0qAXviPiIC5z_mNOPdnJQuI4GWZfwu8mpsNUD0S8WvAwcTkP2a7jS76BeG40MS7eLHYB0GYKdVr21hJrvz021whGE1BLWvghSl6M4QTKU3AzlaI1ClNqp4zHSA9AVt195ThqCtEhbpZ1L7iQCrwMd98SKJihwGzw';
    // const appleUser = jwt.decode(appleAccessToken);
    // console.log('appleUser : \n', appleUser);

    // firsbase에서 로그인 인증
    const userFirebase = await signInWithEmailAndPassword(firebaseAuth, email, idKey)
      .then((user) => user)
      .catch((e) => {
        console.log(e);
        return { err: true, error: e };
      });

    if (userFirebase.err) {
      if (userFirebase.error.code === 'auth/user-not-found') {
        console.log('firebase 인증실패!');
        loginSuccess = false;
      } else if (userFirebase.error.code === 'auth/invalid-email') {
        return res.status(statusCode.NOT_FOUND).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.INVALID_EMAIL));
      } else if (userFirebase.error.code === 'auth/wrong-password') {
        return res.status(statusCode.NOT_FOUND).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.MISS_MATCH_PW));
      } else {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
      }
    }

    // firebase 인증 후, 계정이 없다는 err를 만난 경우! -> 회원가입을 시켜야한다.
    if (loginSuccess === false) {
      type = 'signUp';
      // 처음 로그인 시도를 하는 유저
      // Firebase Authentication을 통해 유저를 생성!!
      const newUserFirebase = await admin
        .auth()
        .createUser({ email, password: idKey })
        .then((user) => user)
        .catch((e) => {
          console.log(e);
          return { err: true, error: e };
        });
      // error handling (거의 없을듯)
      if (newUserFirebase.err) {
        if (newUserFirebase.error.code === 'auth/email-already-exists') {
          return res.status(statusCode.NOT_FOUND).json(util.fail(statusCode.NOT_FOUND, '해당 이메일을 가진 유저가 이미 있습니다.'));
        } else {
          return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        }
      }
      //RDS DB에 유저를 생성한다
      idFirebase = newUserFirebase.uid;
      user = await userDB.addUser(client, email, idKey, provider, idFirebase);
    } else {
      type = 'login';
      // Firebase 인증이 된 경우라면 RDS의 userDB에서 유저 정보를 찾는다.
      idFirebase = userFirebase.user.uid;
      const isExist = await userDB.getUserByIdFirebase(client, idFirebase);
      user = isExist;
    }

    // JWT access token 발급
    const { accesstoken } = jwtHandlers.sign(user);

    res.status(statusCode.OK).send(util.success(statusCode.OK, type == 'login' ? responseMessage.LOGIN_SUCCESS : responseMessage.CREATED_USER, { type, accesstoken }));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
