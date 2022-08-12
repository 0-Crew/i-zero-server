const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const addMyInonveniences = async (client, inconvenienceString, userId, myChallengeId) => {
  const valuesQuery = `('${inconvenienceString}',1,${userId},${myChallengeId}),('${inconvenienceString}',2,${userId},${myChallengeId}),('${inconvenienceString}',3,${userId},${myChallengeId}),('${inconvenienceString}',4,${userId},${myChallengeId}),('${inconvenienceString}',5,${userId},${myChallengeId}),('${inconvenienceString}',6,${userId},${myChallengeId}),('${inconvenienceString}',7,${userId},${myChallengeId})`;

  const { rows } = await client.query(/*sql*/ `
      INSERT INTO my_inconvenience("name","day",user_id,my_challenge_id)
      VALUES ${valuesQuery}
      RETURNING *

      `);

  return convertSnakeToCamel.keysToCamel(rows);
};

const updateMyInonvenienceById = async (client, myInconvenienceId, inconvenienceString) => {
  const { rows } = await client.query(
    /*sql*/ `
        UPDATE my_inconvenience SET ("name",updated_at)=($1,now())
        WHERE my_inconvenience.id = ${myInconvenienceId}
        RETURNING *
        `,
    [inconvenienceString],
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const finishToggleMyInonvenienceById = async (client, myInconvenienceId) => {
  const { rows } = await client.query(/*sql*/ `
          UPDATE my_inconvenience SET (is_finished,updated_at)=(NOT is_finished,now())
          WHERE my_inconvenience.id = ${myInconvenienceId}
          RETURNING *
          `);

  return convertSnakeToCamel.keysToCamel(rows[0]);
};
const getMyInconvenicencesByMyChallengeId = async (client, myChallengeId) => {
  const { rows } = await client.query(/*sql*/ `
    SELECT * FROM my_inconvenience
    WHERE my_challenge_id = ${myChallengeId}
    AND is_deleted = false
    ORDER BY "day"
    `);

  return convertSnakeToCamel.keysToCamel(rows);
};

const getMyInconveniencesForBrowse = async (client, offset, keyword, userId) => {
  // const { rows } = await client.query(/*sql*/ `
  //   SELECT my_inconvenience.updated_at, my_inconvenience.name, my_inconvenience.user_id FROM my_inconvenience
  //   WHERE is_deleted = false
  //   AND my_inconvenience.user_id IN (SELECT u.id FROM "user" u WHERE u.is_private = false )
  //   ORDER BY "updated_at"  DESC
  //   `);

  const { rows } = await client.query(/*sql*/ `
    SELECT u.id, u.name
    FROM "user" u
    JOIN (
        SELECT * 
        FROM my_inconvenience 
        WHERE my_inconvenience.is_deleted = false 
        ${
          offset
            ? `AND my_inconvenience.updated_at < (
            SELECT updated_at 
            FROM my_inconvenience 
            WHERE my_inconvenience.id = '${offset}')`
            : ``
        }
            ) i ON u.id = i.user_id
    WHERE u.is_deleted = false and u.is_private = false and u.id != ${userId}
    -- ${keyword ? `AND (u.name ILIKE '%${keyword}%' OR u.email ILIKE '%${keyword}%')` : ``}
    ${keyword ? `AND (u.name ILIKE '%${keyword}%')` : ``}
    ORDER BY i."updated_at"  DESC
    LIMIT 10
    `);

  return convertSnakeToCamel.keysToCamel(rows);
};
module.exports = { addMyInonveniences, updateMyInonvenienceById, finishToggleMyInonvenienceById, getMyInconvenicencesByMyChallengeId, getMyInconveniencesForBrowse };
