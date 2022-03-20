const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const arrayHandlers = require('../lib/arrayHandlers');

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
const checkIsFollowing = async (client, userId, followingUserId) => {
  const { rows } = await client.query(
    /*sql*/ `
    SELECT * 
    FROM my_following
    WHERE user_id = $1
    AND following_user_id = $2
    AND is_deleted = false
    `,
    [userId, followingUserId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
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

const getFollowerUsers = async (client, userId, keyword) => {
  const { rows } = await client.query(
    /*sql*/ `
    SELECT "user".id, "user".name
    FROM my_following
      LEFT JOIN "user" ON "user".id = my_following.user_id AND "user".is_private = false
    WHERE my_following.following_user_id = $1
    AND my_following.is_deleted = false
    ${keyword ? `AND ("user".name ILIKE '%${keyword}%' OR "user".email ILIKE '%${keyword}%')` : ``}
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
      JOIN "user" ON "user".id = my_following.following_user_id AND "user".is_private = false
    WHERE my_following.user_id = $1
    AND my_following.is_deleted = false
    ${keyword ? `AND ("user".name ILIKE '%${keyword}%' OR "user".email ILIKE '%${keyword}%')` : ``}
      `,
    [userId],
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const getFollowingUsersForMain = async (client, userId, keyword) => {
  const { rows } = await client.query(
    /*sql*/ `
    SELECT "user".id, "user".name
    FROM my_following
      JOIN "user" ON "user".id = my_following.following_user_id
    WHERE my_following.user_id = $1
    AND my_following.is_deleted = false
    ${keyword ? `AND ("user".name ILIKE '%${keyword}%' OR "user".email ILIKE '%${keyword}%')` : ``}
      `,
    [userId],
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const getFollowBackUsers = async (client, userId, userIds) => {
  let { rows } = await client.query(
    /*sql*/ `
    SELECT *
    FROM my_following
    WHERE my_following.following_user_id in (${userIds.join()})
    AND my_following.is_deleted = false
    AND my_following.user_id = $1
      `,
    [userId],
  );
  rows = arrayHandlers.extractValues(rows, 'following_user_id');
  return convertSnakeToCamel.keysToCamel(rows);
};
module.exports = {
  checkFollowing,
  addFollowingUser,
  toggleFollowingUser,
  countFollowing,
  countFollower,
  getFollowerUsers,
  getFollowingUsers,
  getFollowBackUsers,
  checkIsFollowing,
  getFollowingUsersForMain,
};
