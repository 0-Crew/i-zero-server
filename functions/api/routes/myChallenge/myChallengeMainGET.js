const functions = require('firebase-functions');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');

const db = require('../../../db/db');
const { convenienceDB, inconvenienceDB, myChallengeDB, myInconvenienceDB, myFollowingDB } = require('../../../db');
const statusCode = require('../../../constants/statusCode');
const util = require('../../../lib/util');
const responseMessage = require('../../../constants/responseMessage');
const { Client } = require('pg');

module.exports = async (req, res) => {
  const {} = req.body;

  let client;

  try {
    client = await db.connect(req);
    console.log('myFollowings');

    const myFollowings = await myFollowingDB.getFollowingUsers(client, req.user.id, null);
    console.log('myFollowings', myFollowings);
    const inconvenience = await inconvenienceDB.getInconveniences(client);
    let myChallenge = null;
    let myInconveniences = [];
    try {
      myChallenge = await myChallengeDB.getNowMyChallenge(client, req.user.id);
      myInconveniences = await myInconvenienceDB.getMyInconvenicencesByMyChallengeId(client, myChallenge.id);
    } catch {}

    let data = {
      myFollowings,
      myChallenge,
      myInconveniences,
      inconvenience,
    };

    return res.status(statusCode.OK).send(util.success(statusCode.OK, '성공', data));
  } catch (error) {
    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
