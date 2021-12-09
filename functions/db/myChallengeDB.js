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
const addMyChallenge = async (client, convenienceString, fromToday) => {
  const { rows } = await client.query(
    /*sql*/ `
    INSERT INTO my_challenge("name",started_at)
    VALUES ($1,now()${fromToday === false ? '+1' : ''})
    RETURNING *
    `,
    [convenienceString],
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getTest, addMyChallenge };
