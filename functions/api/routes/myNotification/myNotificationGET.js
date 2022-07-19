const functions = require('firebase-functions');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');

const db = require('../../../db/db');
const { convenienceDB, inconvenienceDB, myChallengeDB, myInconvenienceDB, myFollowingDB, myNotificationDB, userDB } = require('../../../db');
const statusCode = require('../../../constants/statusCode');
const util = require('../../../lib/util');
const responseMessage = require('../../../constants/responseMessage');
const arrayHandlers = require('../../../lib/arrayHandlers');

const { Client } = require('pg');

module.exports = async (req, res) => {
  const {} = req.body;

  let client;

  try {
    client = await db.connect(req);

    let myNotifications = await myNotificationDB.getMyNotificationsByReceiverUserId(client, req.user.id);
    console.log('myNotifications', myNotifications);
    if (myNotifications.length > 0) {
      const userIds = arrayHandlers.extractValues(myNotifications, 'userId');
      console.log('userIds', userIds);
      const users = await userDB.getUserByIds(client, userIds);
      console.log('users', users);
      const usersById = users.reduce((acc, x) => {
        acc[x.id] = x;
        return acc;
      }, {});
      console.log('usersById', usersById);
      myNotifications = myNotifications.map((x) => ({
        ...x,
        notiText: usersById[x.userId].name + x.content,
        sentUser: usersById[x.userId],
      }));
    }

    console.log('myNotifications', myNotifications);
    let data = { myNotifications };

    return res.status(statusCode.OK).send(util.success(statusCode.OK, '성공', data));
  } catch (error) {
    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
