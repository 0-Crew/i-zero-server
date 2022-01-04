const functions = require('firebase-functions');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');

const db = require('../../../db/db');
const { convenienceDB, inconvenienceDB, myChallengeDB, myInconvenienceDB } = require('../../../db');
const statusCode = require('../../../constants/statusCode');
const util = require('../../../lib/util');
const responseMessage = require('../../../constants/responseMessage');

module.exports = async (req, res) => {
  const { myChallengeId } = req.query;

  let client;

  try {
    client = await db.connect(req);
    let myChallenge;
    const myChallenges = await myChallengeDB.getMyChallenges(client, req.user.id);
    if (myChallengeId) {
      myChallenge = await myChallengeDB.getMyChallengeById(client, myChallengeId);
    } else {
      myChallenge = await myChallengeDB.getNowMyChallenge(client, req.user.id);
    }
    const myInconveniences = await myInconvenienceDB.getMyInconvenicencesByMyChallengeId(client, myChallenge.id);

    let data = {
      myChallenges,
      selectedChallenge: { myChallenge, myInconveniences },
    };

    return res.status(statusCode.OK).send(util.success(statusCode.OK, '성공', data));
  } catch (error) {
    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
