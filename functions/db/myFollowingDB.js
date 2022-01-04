const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const checkFollowing = async (client, userId, followingUserId) => {
  const { rows } = await client.query(
    `
    SELECT * 
    FROM my_following
    WHERE user_id = $1
    AND following_user_id = $2
    `,
    [userId, followingUserId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const addFollowingUser = async (client, userId, followingUserId) => {
  const { rows } = await client.query(
    /*sql*/ `
      INSERT INTO "my_following"(user_id,following_user_id)
      VALUES($1,$2)
      RETURNING *
      `,
    [userId, followingUserId],
  );

  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const toggleFollowingUser = async (client, relation, userId, followingUserId) => {
  const { rows } = await client.query(
    `
      UPDATE "my_following" f
      SET is_deleted = $1
      WHERE user_id = $2
      AND following_user_id = $3
      `,
    [relation, userId, followingUserId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const countFollowing = async (client, userId) => {
  const { rows } = await client.query(
    `
      SELECT count(*) 
      FROM my_following
      WHERE user_id = $1
      AND is_deleted = false
      `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const countFollower = async (client, userId) => {
  const { rows } = await client.query(
    `
      SELECT count(*) 
      FROM my_following
      WHERE following_user_id = $1
      AND is_deleted = false
      `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { checkFollowing, addFollowingUser, toggleFollowingUser, countFollowing, countFollower };
