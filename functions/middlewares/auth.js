const functions = require('firebase-functions');
const { TOKEN_EXPIRED, TOKEN_INVALID } = require('../constants/jwt');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const jwtHandlers = require('../lib/jwtHandlers');
const { userDB } = require('../db');
const db = require('../db/db');
const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

const checkUser = async (req, res, next) => {
  const client = await db.connect(req);
  try {
    let user;
    let userId;
    let needNewAccessToken = false;
    let needNewRefreshToken = false;
    const token = {};

    const { authorization, authorizationRefresh } = req.headers;
    let decodedAccessToken = TOKEN_INVALID;
    let decodedRefreshToken = TOKEN_INVALID;

    if (!authorization && !authorizationRefresh) {
      return res.status(400).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.EMPTY_TOKEN));
    }

    // authorization 복호
    if (authorization) {
      decodedAccessToken = jwtHandlers.verify(authorization);
    }
    // authorizationRefresh 복호
    if (authorizationRefresh) {
      decodedRefreshToken = jwtHandlers.verify(authorizationRefresh);
    }

    // 두 토큰이 전부 유효하지 않은 경우 에러 처리
    if (decodedAccessToken === TOKEN_INVALID && decodedRefreshToken === TOKEN_INVALID) {
      return res.status(401).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.INVALID_TOKEN));
    }

    if (decodedAccessToken === TOKEN_EXPIRED || decodedAccessToken === TOKEN_INVALID) {
      // access가 만료되고, refresh도 만료된 경우
      if (decodedRefreshToken === TOKEN_EXPIRED || decodedRefreshToken === TOKEN_INVALID) {
        return res.status(401).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.EXPIRED_TOKEN));
      }
      // access가 만료되고, refresh는 만료되지 않은 경우
      // refresh 토큰의 정보를 활용하여 access를 재발급하도록 한다.
      if (decodedRefreshToken !== TOKEN_EXPIRED) {
        const checkedUser = await userDB.getUserBySnsIdAndProvider(client, decodedRefreshToken.sns_id, decodedRefreshToken.provider);
        userId = checkedUser.id;
        needNewAccessToken = true;
      }
    }
    // accessToken이 만료되지 않은 경우
    // accessToken의 정보를 그대로 활용 한다.
    else {
      userId = decodedAccessToken.id;
    }

    // access와 refresh를 모두 제대로 복호한 경우, userId를 얻어낼 수 있는데 얻어낸 userId가 없다면 에러처리
    if (!userId) {
      return res.status(401).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.INVALID_TOKEN));
    }

    // 얻어낸 userId에 해당하는 유저 정보가 DB에 있는지 확인한다.
    user = await userDB.getUserById(client, userId);
    if (!user) return res.status(401).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_USER));

    // access 토큰을 재발급해야 하는 경우
    if (needNewAccessToken) {
      const userAccess = jwtHandlers.sign(user);
      token.accessToken = userAccess;
      console.log('🥵 userAccess 갱신');
    }

    req.user = user;

    if (token) {
      req.token = token;
    }

    functions.logger.log(`email: ${user.email} uid: ${user.id}`, user.name, `[${req.method.toUpperCase()}]`, req.originalUrl);
  } catch (error) {
    console.log(error);
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    return res.status(500).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }

  next();
};

module.exports = { checkUser };
