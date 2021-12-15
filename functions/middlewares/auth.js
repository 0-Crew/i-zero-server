const functions = require('firebase-functions');
const { TOKEN_EXPIRED, TOKEN_INVALID } = require('../constants/jwt');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const jwtHandlers = require('../lib/jwtHandlers');
const { userDB } = require('../db');
const db = require('../db/db');

const checkUser = async (req, res, next) => {
  let client;
  try {
    client = await db.connect(req);

    let user;

    const { isweb } = req.headers;
    const authHeader = String(req.headers.authorization || '');

    if (!authHeader) return res.status(400).send({ err: true, userMessage: 'No auth header' });
    const token = authHeader;
    if (!token) return res.status(400).send({ err: true, userMessage: 'Empty token' });

    if (isweb) {
      const decodedToken = jwtHandlers.verify(token);
      if (decodedToken === TOKEN_EXPIRED) return res.status(401).send({ err: true, userMessage: 'Expired token' });
      if (decodedToken === TOKEN_INVALID) return res.status(401).send({ err: true, userMessage: 'Invalid token' });

      const id = decodedToken.id;
      if (!id) return res.status(401).send({ err: true, userMessage: 'Invalid token' });

      user = await userDB.getUserById(client, id);
    } else {
      const decodedToken = jwtHandlers.verify(token);
      const idFirebase = decodedToken.idFirebase;

      user = await userDB.getUserByIdFirebase(client, idFirebase);
    }

    if (!user) return res.status(401).send({ err: true, userMessage: 'No such user' });

    req.user = user;

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(`email: ${user.email} uid: ${user.id}`, ip, user.firstName, user.lastName, `[${req.method.toUpperCase()}]`, req.originalUrl);
    functions.logger.log(`email: ${user.email} uid: ${user.id}`, ip, user.firstName, user.lastName, `[${req.method.toUpperCase()}]`, req.originalUrl);
  } catch (error) {
    console.log(error);
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(500).json({ err: true, userMessage: 'Error occurred' });
  } finally {
    client.release();
  }

  next();
};

module.exports = { checkUser };
