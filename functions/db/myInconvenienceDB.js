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

module.exports = { addMyInonveniences, updateMyInonvenienceById };

const finishToggleMyInonvenienceById = async (client, myInconvenienceId) => {
  const { rows } = await client.query(/*sql*/ `
          UPDATE my_inconvenience SET (is_finished,updated_at)=(NOT is_finished,now())
          WHERE my_inconvenience.id = ${myInconvenienceId}
          RETURNING *
          `);

  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { addMyInonveniences, updateMyInonvenienceById, finishToggleMyInonvenienceById };
