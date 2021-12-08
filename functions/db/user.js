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

  return convertSnakeToCamel.keysToCamel(rows);
};

const getUserById = async (client, userId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM "user"
    WHERE id = ${userId}
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getUserByIdFirebase = async (client, idFirebase) => {
  const { rows } = await client.query(
    `
    SELECT * FROM "user"
    WHERE id_firebase = $1
    `,
    [idFirebase],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { getTest, getUserByIdFirebase, getUserById, addUser };
