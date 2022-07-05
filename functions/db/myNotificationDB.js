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
  if (followingUserIds.length === 0) return [];
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

const addButtonNotification = async (client, userId, receiverUserId, notiType) => {
  const { rows } = await client.query(
    /*sql*/ `
      INSERT INTO my_notification(notification_id,user_id,receiver_user_id)
      VALUES ($1, $2, $3)
      `,
    [notiType, userId, receiverUserId],
  );

  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { addFollowingNotification, addChallengeStartNotification, addButtonNotification };
