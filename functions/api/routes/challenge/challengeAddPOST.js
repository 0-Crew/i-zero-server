const functions = require('firebase-functions');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');

const db = require('../../../db/db');
const { myChallengeDB, myInconvenienceDB, inconvenienceDB } = require('../../../db');

module.exports = async (req, res) => {
  const { convenienceString, inconvenienceString, fromToday } = req.body;
  if (!convenienceString || !inconvenienceString) return res.status(404).json({ err: true, userMessage: 'Not enough parameters.' });

  let client;

  try {
    client = await db.connect(req);

    const myChallenge = myChallengeDB.addMyChallenge(client, convenienceString, fromToday);
    const myInconveniences = myInconvenienceDB.addMyInonveniences(client, inconvenienceString);
    res.status(200).json({
      err: false,

      data: {
        myChallenge,
        myInconveniences,
      },
    });
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(500).json({ err: error, userMessage: error.message });
  } finally {
    client.release();
  }
};
