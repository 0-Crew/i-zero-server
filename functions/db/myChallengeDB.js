const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const addMyChallenge = async (client, convenienceString, isfromToday, userId) => {
  const { rows } = await client.query(
    /*sql*/ `
    INSERT INTO my_challenge("name",started_at,user_id)
    VALUES ($1,${isfromToday === false ? "now() + interval '1 day'" : 'now()'},${userId})
    RETURNING *
    `,
    [convenienceString],
  );

  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getNowMyChallenge = async (client, userId) => {
  const { rows } = await client.query(/*sql*/ `
    SELECT * FROM my_challenge
    WHERE user_id = ${userId}
      AND now() BETWEEN created_at AND created_at + interval '7 day'
      AND is_deleted = false
    ORDER BY created_at DESC

    `);

  return convertSnakeToCamel.keysToCamel(rows[0]);
};
const getMyChallengeById = async (client, myChallengeId) => {
  const { rows } = await client.query(/*sql*/ `
    SELECT * FROM my_challenge
    WHERE id = ${myChallengeId}
      AND is_deleted = false

    `);

  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getMyChallenges = async (client, userId) => {
  const { rows } = await client.query(/*sql*/ `
    SELECT * FROM my_challenge
    WHERE user_id = ${userId}
      AND is_deleted = false
    ORDER BY created_at 

    `);

  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getNowMyChallenge, addMyChallenge, getMyChallenges, getMyChallengeById };
