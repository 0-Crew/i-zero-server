const functions = require('firebase-functions');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');

const db = require('../../../db/db');
const { myChallengeDB, myInconvenienceDB, inconvenienceDB } = require('../../../db');
const statusCode = require('../../../constants/statusCode');
const util = require('../../../lib/util');
const responseMessage = require('../../../constants/responseMessage');

module.exports = async (req, res) => {
  const { myInconvenienceId, inconvenienceString } = req.body;
  if (!myInconvenienceId || !inconvenienceString) return res.status(404).json({ err: true, userMessage: 'Not enough parameters.' });

  let client;

  try {
    client = await db.connect(req);

    const myInconvenience = await myInconvenienceDB.updateMyInonvenienceById(client, myInconvenienceId, inconvenienceString);

    let data = {
      myInconvenience,
    };

    return res.status(statusCode.OK).send(util.success(statusCode.OK, '성공', data));
  } catch (error) {
    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
