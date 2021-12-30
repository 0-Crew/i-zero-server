const functions = require('firebase-functions');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');

const db = require('../../../db/db');
const { myChallengeDB, myInconvenienceDB, inconvenienceDB } = require('../../../db');

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
    await client.query('COMMIT');

    res.status(200).json({
      err: false,

      data: {
        myChallenge,
        myInconveniences,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');

    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(500).json({ err: error, userMessage: error.message });
  } finally {
    client.release();
  }
};
