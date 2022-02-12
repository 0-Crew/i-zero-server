const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { myFollowingDB } = require('../../../db');

module.exports = async (req, res) => {
  const user = req.user;
  let client;

  try {
    client = await db.connect(req);
    const followers = await myFollowingDB.getFollowers(client, user.id);
    console.log('followers : ', followers);

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_FOLLOWERS_SUCCESS));
  } catch (error) {
    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
