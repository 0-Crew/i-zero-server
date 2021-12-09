const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const addMyInonveniences = async (client, inconvenienceString) => {
  const valuesQuery = `("${inconvenienceString}",1),("${inconvenienceString}",2),("${inconvenienceString}",3),("${inconvenienceString}",4),("${inconvenienceString}",5),("${inconvenienceString}",6),("${inconvenienceString}",7),`;

  const { rows } = await client.query(
    /*sql*/ `
      INSERT INTO my_inconvenience("name","day")
      VALUES $1
      RETURNING *
      `,
    [valuesQuery],
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { addMyInonveniences };
