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
      AND is_finished = false
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

const getUsersChallenge = async (client, userIds) => {
  const { rows } = await client.query(/*sql*/ `
    SELECT id, "user_id" , "name", started_at, (SELECT count(*) FROM my_inconvenience WHERE my_inconvenience.my_challenge_id = my_challenge.id AND my_inconvenience.is_finished = true) AS "count"
    FROM my_challenge 
    WHERE my_challenge.user_id in (${userIds.join()})
    AND my_challenge.is_deleted = false
    AND now() BETWEEN started_at AND started_at + interval '7 day'
    ORDER BY my_challenge.started_at 
      `);
  return convertSnakeToCamel.keysToCamel(rows);
};

const finishMyChanllengeByMyChallengeId = async (client, myChallengeId) => {
  const { rows } = await client.query(/*sql*/ `
    UPDATE my_challenge
    SET is_finished = true
    WHERE id = ${myChallengeId}
    AND is_deleted = false
    RETURNING *
      `);
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { getNowMyChallenge, addMyChallenge, getMyChallenges, getMyChallengeById, getUsersChallenge, finishMyChanllengeByMyChallengeId };
