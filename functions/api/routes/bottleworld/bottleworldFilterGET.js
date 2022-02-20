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
    const countFollower = await myFollowingDB.countFollower(client, user.id);
    const countFollowing = await myFollowingDB.countFollowing(client, user.id);

    const data = { countFollower: Number(countFollower.count), countFollowing: Number(countFollowing.count) };
    console.log('countFollower : ', countFollower, 'countFollowing :', countFollowing, 'data :', data);

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_FILTER_SUCCESS, data));
  } catch (error) {
    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
