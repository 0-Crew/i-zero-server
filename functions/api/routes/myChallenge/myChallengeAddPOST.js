const functions = require('firebase-functions');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');

const db = require('../../../db/db');
const { myChallengeDB, myInconvenienceDB, inconvenienceDB, myNotificationDB, myFollowingDB } = require('../../../db');
const statusCode = require('../../../constants/statusCode');
const util = require('../../../lib/util');
const responseMessage = require('../../../constants/responseMessage');
const arrayHandlers = require('../../../lib/arrayHandlers');

module.exports = async (req, res) => {
  const { convenienceString, inconvenienceString, isfromToday } = req.body;
  if (!convenienceString || !inconvenienceString) return res.status(404).json({ err: true, userMessage: 'Not enough parameters.' });

  let client;

  try {
    client = await db.connect(req);
    await client.query('BEGIN');
    const myChallenge = await myChallengeDB.addMyChallenge(client, convenienceString, isfromToday, req.user.id);
    console.log(`myChallenge`, myChallenge);
    const myInconveniences = await myInconvenienceDB.addMyInonveniences(client, inconvenienceString, req.user.id, myChallenge.id);

    // 내 팔로워들을 조회
    const folloewerIds = arrayHandlers.extractValues(await myFollowingDB.getFollowerUserIds(client, req.user.id), 'id');
    // 해당 팔로워들에 해당하는 알림 row 생성
    await myNotificationDB.addChallengeStartNotification(client, req.user.id, folloewerIds);
    await client.query('COMMIT');

    let data = {
      myChallenge,
      myInconveniences,
    };

    return res.status(statusCode.OK).send(util.success(statusCode.OK, '성공', data));
  } catch (error) {
    // 서버 에러시 500 return
    await client.query('ROLLBACK');

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
