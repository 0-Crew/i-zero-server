const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getNotifications = async (client, userId) => {
  const { rows } = await client.query(/*sql*/ `
     SELECT my_notification.*
FROM my_notification
WHERE my_notification.receiver_user_id = ${userId}
    AND my_notification.is_deleted = FALSE
ORDER BY my_notification.created_at DESC;
        `);

  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getNotifications };
