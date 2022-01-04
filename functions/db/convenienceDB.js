const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getConveniences = async (client) => {
  const { rows } = await client.query(
    `
    SELECT * FROM convenience
    `,
  );

  return convertSnakeToCamel.keysToCamel(rows);
};
module.exports = { getConveniences };
