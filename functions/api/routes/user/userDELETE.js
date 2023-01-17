const functions = require('firebase-functions');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');
const db = require('../../../db/db');
const { userDB } = require('../../../db');
const statusCode = require('../../../constants/statusCode');
const util = require('../../../lib/util');
const responseMessage = require('../../../constants/responseMessage');
const axios = require('axios');
const { appleAuth } = require('../../../lib/OAuth');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  let client;

  try {
    client = await db.connect(req);
    await client.query(`BEGIN`);
    const user = await userDB.deleteUser(client, req.user.id);
    await client.query(`COMMIT`);
    if (!user) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER));
    } else if (user.provider === 'apple') {
      const client_secret = () => {
        let privateKey = process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n');
        let token = jwt.sign(
          {
            iss: process.env.APPLE_TEAMID,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 120,
            aud: 'https://appleid.apple.com',
            sub: process.env.APPLE_CLIENTID,
          },
          privateKey,
          {
            algorithm: 'ES256',
            header: {
              alg: 'ES256',
              kid: process.env.APPLE_KEYID,
            },
          },
        );
        console.log(token);
        return token;
      };

      const refresh_token = async (code) => {
        const client_secret = makeJWT();
        try {
          let refresh_token;
          let data = {
            code: code,
            client_id: process.env.APPLE_CLIENTID,
            client_secret: client_secret,
            grant_type: 'authorization_code',
          };
          await axios
            .post(`https://appleid.apple.com/auth/token`, qs.stringify(data), {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            })
            .then(async (res) => {
              refresh_token = String(res.data.refresh_token);
            });

          return refresh_token;
        } catch (error) {
          console.log(error);
        }
      };

      let data = {
        token: refresh_token,
        client_id: process.env.APPLE_CLIENTID,
        client_secret: client_secret,
        token_type_hint: 'refresh_token',
      };

      const response = await axios
        .post(`https://appleid.apple.com/auth/revoke`, qs.stringify(data), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
        .then(async (res) => {
          console.log(res.data);
        });
    }
    return res.status(statusCode.OK).send(util.success(statusCode.OK, '탈퇴 성공', user));
  } catch (error) {
    // 서버 에러시 500 return
    await client.query(`ROLLBACK`);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
