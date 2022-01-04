const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getInconveniences = async (client) => {
  const { rows } = await client.query(
    `
    SELECT * FROM inconvenience
    `,
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getInconveniences };
