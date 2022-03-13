const functions = require('firebase-functions');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');

const db = require('../../../db/db');
const { convenienceDB, inconvenienceDB, myChallengeDB, myInconvenienceDB, myFollowingDB, userDB } = require('../../../db');
const statusCode = require('../../../constants/statusCode');
const util = require('../../../lib/util');
const responseMessage = require('../../../constants/responseMessage');
const { Client } = require('pg');
const { user } = require('firebase-functions/v1/auth');

module.exports = async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(404).json({ err: true, userMessage: 'Not enough parameters.' });

  let client;

  try {
    client = await db.connect(req);
    let user;
    try {
      user = await userDB.getUserById(client, userId);
    } catch {
      return res.status(404).json({ err: true, userMessage: responseMessage.NO_USER });
    }
    const isFollowing = (await myFollowingDB.checkIsFollowing(client, req.user.id, userId)).length === 1 ? true : false;

    let myChallenge = {};
    let myInconveniences = [];
    try {
      myChallenge = await myChallengeDB.getNowMyChallenge(client, userId);
      myInconveniences = await myInconvenienceDB.getMyInconvenicencesByMyChallengeId(client, myChallenge.id);
    } catch {}

    let data = {
      user,
      isFollowing,
      myChallenge,
      myInconveniences,
    };

    return res.status(statusCode.OK).send(util.success(statusCode.OK, '성공', data));
  } catch (error) {
    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
