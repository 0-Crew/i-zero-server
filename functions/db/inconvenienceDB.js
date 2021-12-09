const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getInonveniences = async (client) => {
  const { rows } = await client.query(
    `
    SELECT * FROM inconvenience
    `,
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getInonveniences };
