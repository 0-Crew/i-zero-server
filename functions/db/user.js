const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getTest = async (client) => {
  const { rows } = await client.query(
    `
    SELECT * FROM test
    `,
  );

  return convertSnakeToCamel.keysToCamel(rows);
};
const addUser = async (client, email, snsId, provider, idFirebase) => {
  const { rows } = await client.query(
    /*sql*/ `
    INSERT INTO "user"(email,sns_id,provider,id_firebase)
    VALUES($1,$2,$3,$4)
    RETURNING *
    `,
    [email, snsId, provider, idFirebase],
  );

  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getUserBySnsIdAndProvider = async (client, snsId, provider) => {
  const { rows } = await client.query(
    `
    SELECT * FROM "user"
    WHERE sns_id = $1
    AND provider = $2
    AND is_deleted = false
    `,
    [snsId, provider],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const checkUserName = async (client, name) => {
  const { rows } = await client.query(
    `
    SELECT u.name FROM "user" u
    WHERE name = $1
    AND is_deleted = false
    `,
    [name],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const checkUserPrivate = async (client, idFirebase) => {
  const { rows } = await client.query(
    `
    SELECT u.is_private
    FROM "user" u
    WHERE u.id_firebase = $1
    AND is_deleted = false
    `,
    [idFirebase],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const toggleUserPrivate = async (client, toggledPrivate, idFirebase) => {
  const { rows } = await client.query(
    `
    UPDATE "user" u
    SET is_private = $1
    WHERE u.id_firebase = $2
    AND is_deleted = false
    `,
    [toggledPrivate, idFirebase],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const setUserName = async (client, name, idFirebase) => {
  const { rows } = await client.query(
    /*sql*/ `
    UPDATE "user"
    SET "name" = $1
    WHERE "user".id_firebase = $2
    AND is_deleted = false
    RETURNING *
    `,
    [name, idFirebase],
  );

  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getUserById = async (client, userId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM "user"
    WHERE id = ${userId}
    AND is_deleted = false
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getUserByIdFirebase = async (client, idFirebase) => {
  const { rows } = await client.query(
    `
    SELECT * FROM "user"
    WHERE id_firebase = $1
    AND is_deleted = false

    `,
    [idFirebase],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { getTest, getUserBySnsIdAndProvider, getUserByIdFirebase, getUserById, addUser, checkUserName, setUserName, checkUserPrivate, toggleUserPrivate };
