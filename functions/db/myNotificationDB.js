const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getMyNotificationsByReceiverUserId = async (client, receiverUserId) => {
  const { rows } = await client.query(/*sql*/ `
SELECT my_notification.*,notification.is_button_enabled,notification.content,notification.button_text,notification.name as notification_name
FROM my_notification
JOIN notification on my_notification.notification_id = notification.id
WHERE my_notification.receiver_user_id = ${receiverUserId}
    AND my_notification.is_deleted = FALSE
ORDER BY my_notification.created_at DESC;`);
  return convertSnakeToCamel.keysToCamel(rows);
};

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

module.exports = { addFollowingNotification, addChallengeStartNotification, addButtonNotification, getMyNotificationsByReceiverUserId };
