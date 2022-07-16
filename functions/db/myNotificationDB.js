const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getMyNotificationsByReceiverUserId = async (client, receiverUserId) => {
  const { rows } = await client.query(/*sql*/ `
     SELECT my_notification.*
FROM my_notification
WHERE my_notification.receiver_user_id = ${receiverUserId}
    AND my_notification.is_deleted = FALSE
ORDER BY my_notification.created_at DESC;
        `);

  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getMyNotificationsByReceiverUserId };
