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

module.exports = async (req, res) => {
  let client;

  try {
    client = await db.connect(req);
    await client.query(`BEGIN`);
    const user = await userDB.deleteUser(client, req.user.id);
    console.log('user', user);
    let data = {
      user,
    };
    await client.query(`COMMIT`);
    if (user.provider === 'apple') {
      // const appleUser = await appleAuth(token);
      const appleuser = await axios({
        method: 'POST',
        url: 'https://appleid.apple.com/auth/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({ client_id: 'com.teamZero.WYB', client_secret: 2, grant_type: 'refresh_token', refresh_token: '' }),
      });
      const lists = await axios({
        method: 'POST',
        url: 'https://appleid.apple.com/auth/revoke',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({ client_id: 'com.teamZero.WYB', client_secret: 2, token: user.authorization_code }),
      });
    }
    return res.status(statusCode.OK).send(util.success(statusCode.OK, '성공', data));
  } catch (error) {
    // 서버 에러시 500 return
    await client.query(`ROLLBACK`);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
