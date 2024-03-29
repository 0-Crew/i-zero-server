const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const deleteUser = async (client, userId) => {
  const { rows } = await client.query(/*sql*/ `
    UPDATE "user"
    SET is_deleted = true
    WHERE id = ${userId}
    RETURNING *
    `);
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const addUser = async (client, email, snsId, provider, authorizationCode) => {
  const { rows } = await client.query(
    /*sql*/ `
    INSERT INTO "user"(email,sns_id,provider,authorization_code)
    VALUES($1,$2,$3,$4)
    RETURNING *
    `,
    [email, snsId, provider, authorizationCode],
  );

  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const checkUserName = async (client, name) => {
  const { rows } = await client.query(
    /*sql*/ `
    SELECT u.name FROM "user" u
    WHERE name = $1
    AND is_deleted = false
    `,
    [name],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const checkUserPrivate = async (client, userId) => {
  const { rows } = await client.query(
    /*sql*/ `
    SELECT u.is_private
    FROM "user" u
    WHERE u.id = $1
    AND is_deleted = false
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const toggleUserPrivate = async (client, toggledPrivate, userId) => {
  const { rows } = await client.query(
    /*sql*/ `
    UPDATE "user" u
    SET is_private = $1
    WHERE u.id = $2
    AND is_deleted = false
    `,
    [toggledPrivate, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const setUserName = async (client, name, userId) => {
  const { rows } = await client.query(
    /*sql*/ `
    UPDATE "user"
    SET "name" = $1
    WHERE "user".id = $2
    AND is_deleted = false
    RETURNING *
    `,
    [name, userId],
  );

  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getUserById = async (client, userId) => {
  const { rows } = await client.query(/*sql*/ `
    SELECT * FROM "user"
    WHERE id = ${userId}
    AND is_deleted = false
    `);
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getUserByIds = async (client, userIds) => {
  const { rows } = await client.query(/*sql*/ `
    SELECT "user".id,"user".name FROM "user"
    WHERE "user".id in (${userIds.join()})
    AND is_deleted = false
    `);
  return convertSnakeToCamel.keysToCamel(rows);
};

const getUserBySnsIdAndProvider = async (client, snsId, provider) => {
  const { rows } = await client.query(
    /*sql*/ `
    SELECT id,email,name 
    FROM "user" 
    WHERE sns_id = $1
    AND provider = $2
    AND  is_deleted = false
    `,
    [snsId, provider],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const setRefreshToken = async (client, userId, refreshToken) => {
  const { rows } = await client.query(
    /*sql*/ `
    UPDATE "user"
    SET "refresh_token" = $1
    WHERE "user".id = $2
    AND is_deleted = false
    `,
    [refreshToken, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { deleteUser, getUserBySnsIdAndProvider, getUserById, addUser, checkUserName, setUserName, checkUserPrivate, toggleUserPrivate, setRefreshToken, getUserByIds };
