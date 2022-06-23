const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const addFollowingNotification = async (client, userId, followingUserId) => {
  const valuesQuery = `('1',${userId},${followingUserId}),(2,${followingUserId},${userId})`;

  const { rows } = await client.query(/*sql*/ `
      INSERT INTO my_notification(notification_id,user_id,receiver_user_id)
      VALUES ${valuesQuery}
      `);

  return convertSnakeToCamel.keysToCamel(rows);
};

const addChallengeStartNotification = async (client, userId, followingUserIds) => {
  const valuesQuery = Object.values(
    followingUserIds.reduce((acc, cur, index) => {
      acc[index] = `(3,${userId},${cur})`;
      return acc;
    }, {}),
  ).join(',');

  const { rows } = await client.query(/*sql*/ `
      INSERT INTO my_notification(notification_id,user_id,receiver_user_id)
      VALUES ${valuesQuery}
      `);

  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { addFollowingNotification, addChallengeStartNotification };
