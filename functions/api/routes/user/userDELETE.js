const functions = require('firebase-functions');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');

const db = require('../../../db/db');
const { userDB } = require('../../../db');
const statusCode = require('../../../constants/statusCode');
const util = require('../../../lib/util');
const responseMessage = require('../../../constants/responseMessage');

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

    return res.status(statusCode.OK).send(util.success(statusCode.OK, '성공', data));
  } catch (error) {
    // 서버 에러시 500 return
    await client.query(`ROLLBACK`);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
