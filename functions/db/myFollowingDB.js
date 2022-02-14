const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const checkFollowing = async (client, userId, followingUserId) => {
  const { rows } = await client.query(
    /*sql*/ `
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
    /*sql*/ `
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
    /*sql*/ `
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
    /*sql*/ `
      SELECT count(*) 
      FROM my_following
      WHERE following_user_id = $1
      AND is_deleted = false
      `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getFollowers = async (client, userId) => {
  const { rows } = await client.query(
    /*sql*/ `
    SELECT * 
    FROM my_following
    WHERE my_following.following_user_id = $1
      `,
    [userId],
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const getFollowingUsers = async (client, userId, keyword) => {
  const { rows } = await client.query(
    /*sql*/ `
    SELECT "user".id, "user".name
    FROM my_following
      LEFT JOIN "user" ON "user".id = my_following.following_user_id AND "user".is_private = false
    WHERE my_following.user_id = $1
    AND my_following.is_deleted = false
    ${keyword ? `AND ("user".name ILIKE '%${keyword}%' OR "user".email ILIKE '%${keyword}%')` : ``}
      `,
    [userId],
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const getUsersChallenge = async (client, userIds) => {
  const { rows } = await client.query(/*sql*/ `
    SELECT "user_id" AS id, "name", started_at
    FROM my_challenge
    WHERE my_challenge.user_id in (${userIds.join()})
    AND my_challenge.is_deleted = false
    ORDER BY my_challenge.started_at DESC
    LIMIT 1 OFFSET 0 
      `);

  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { checkFollowing, addFollowingUser, toggleFollowingUser, countFollowing, countFollower, getFollowers, getFollowingUsers, getUsersChallenge };
