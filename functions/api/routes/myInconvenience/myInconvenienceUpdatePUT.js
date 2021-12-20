const functions = require('firebase-functions');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');

const db = require('../../../db/db');
const { myChallengeDB, myInconvenienceDB, inconvenienceDB } = require('../../../db');

module.exports = async (req, res) => {
  const { myInconvenienceId, inconvenienceString } = req.body;
  if (!myInconvenienceId || !inconvenienceString) return res.status(404).json({ err: true, userMessage: 'Not enough parameters.' });

  let client;

  try {
    client = await db.connect(req);

    const myInconvenience = myInconvenienceDB.updateMyInonvenienceById(client, myInconvenienceId, inconvenienceString);
    res.status(200).json({
      err: false,
      data: {
        myInconvenience,
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
