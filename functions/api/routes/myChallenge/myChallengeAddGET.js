const functions = require('firebase-functions');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');

const db = require('../../../db/db');
const { convenienceDB, inconvenienceDB } = require('../../../db');
const statusCode = require('../../../constants/statusCode');
const util = require('../../../lib/util');
const responseMessage = require('../../../constants/responseMessage');

module.exports = async (req, res) => {
  const {} = req.body;

  let client;

  try {
    client = await db.connect(req);
    const convenience = await convenienceDB.getConveniences(client);
    const inconvenience = await inconvenienceDB.getInconveniences(client);

    res.status(200).json({
      err: false,
      convenience,
      inconvenience,
    });
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
