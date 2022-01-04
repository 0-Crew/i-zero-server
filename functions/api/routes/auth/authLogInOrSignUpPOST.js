const functions = require('firebase-functions');
const admin = require('firebase-admin');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB } = require('../../../db');
const jwtHandlers = require('../../../lib/jwtHandlers');
const { firebaseAuth } = require('../../../config/firebaseClient');
const { signInWithEmailAndPassword } = require('firebase/auth');



/*
1. 클라이언트로부터 sns_id (소셜로그인 후 받은 값), email (소셜로그인 후 받은 이메일), provider (어떤 sns인지??) 를 받는다
2. firebase 인증을 통해 가입된 유저인지 아닌지 파악한다
2-1. 이미 가입된 유저라면 3으로 넘어간다.
2-2. 처음 접근하는 유저라면 Firebase Authentication에 유저를 생성하고, RDS DB에도 유저 데이터를 저장한다
3. idFirebase가 담긴 accesstoken을 발급한다.
4. 발급된 토큰을 들고 신나게 춤춘다.
*/

module.exports = async (req, res) => {
  const { email, snsId, provider } = req.body;

  if (!email || !snsId || !provider) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    let loginSuccess
    let idFirebase;
    let user;
    
    // firsbase에서 로그인 인증
    const userFirebase = await signInWithEmailAndPassword(firebaseAuth, email, snsId)
      .then((user) => user)
      .catch((e) => {
        console.log(e);
        return { err: true, error: e };
      });

    if (userFirebase.err) {
      if (userFirebase.error.code === 'auth/user-not-found') {
        console.log("firebase 인증실패!")
        loginSuccess = false
      } else if (userFirebase.error.code === 'auth/invalid-email') {
        return res.status(statusCode.NOT_FOUND).json(util.fail(statusCode.NOT_FOUND, responseMessage.INVALID_EMAIL));
      } else if (userFirebase.error.code === 'auth/wrong-password') {
        return res.status(statusCode.NOT_FOUND).json(util.fail(statusCode.NOT_FOUND, responseMessage.MISS_MATCH_PW));
      } else {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
      }
    }

    // firebase 인증 후, 계정이 없다는 err를 만난 경우! -> 회원가입을 시켜야한다.
    if (loginSuccess===false){
    // 처음 로그인 시도를 하는 유저
    // Firebase Authentication을 통해 유저를 생성!!
      const newUserFirebase = await admin
        .auth()
        .createUser({ email ,password:snsId })
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
      user = await userDB.addUser(client, email, snsId, provider, idFirebase);
    } else {
      // Firebase 인증이 된 경우라면 RDS의 userDB에서 유저 정보를 찾는다.
      idFirebase = userFirebase.user.uid;
      const isExist = await userDB.getUserByIdFirebase(client,idFirebase);
      user = isExist;
    }

    // JWT access token 발급
    const { accesstoken } = jwtHandlers.sign(user);

    // 계정을 만든 이후에는 무조건 이름 설정뷰로 이동하기 떄문에, 유저의 이름이 null이라면 지금 막 가입을 한 계정이다!
    if (!user.name) {
      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CREATED_USER, { accesstoken }));
    }
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.LOGIN_SUCCESS, { accesstoken }));

    
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
