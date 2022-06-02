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

const addUser = async (client, email, snsId, provider) => {
  const { rows } = await client.query(
    /*sql*/ `
    INSERT INTO "user"(email,sns_id,provider)
    VALUES($1,$2,$3)
    RETURNING *
    `,
    [email, snsId, provider],
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

const getUserBySnsIdAndProvider = async (client, snsId, provider) => {
  const { rows } = await client.query(/*sql*/ `
    SELECT u.id,u.email,u.name, FROM "user" u
    WHERE sns_id = ${snsId}
    AND provider = ${provider}
    AND is_deleted = false
    `);
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { deleteUser, getUserBySnsIdAndProvider, getUserById, addUser, checkUserName, setUserName, checkUserPrivate, toggleUserPrivate };
