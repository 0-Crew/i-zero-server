const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { myFollowingDB } = require('../../../db');

/*
1. 클라이언트로부터 토큰을 받아 유저의 id를 받고, body를 통해 해당 유저가 팔로우 할 유저의 id를 받아온다.
2. 해당 row 를 찾아 없다면 생성 
3. row가 이미 존재한다면 있다면 is_deleted를 토글한다. (is_deleated가 true = 언팔로우 상태, false = 팔로잉 상태) 
*/

module.exports = async (req, res) => {
  const { followingUserId } = req.body;
  const user = req.user;
  console.log('get followingUserId');

  if (!followingUserId) {
    console.log('no followingUserId');
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  let client;

  try {
    client = await db.connect(req);
    const isExistFollowing = await myFollowingDB.checkFollowing(client, user.id, Number(followingUserId));
    console.log('isExistFollowing?? ', isExistFollowing);

    if (!isExistFollowing) {
      const newFollowing = await myFollowingDB.addFollowingUser(client, user.id, followingUserId);
      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.FOLLOW_SUCCESS));
    } else {
      const relation = isExistFollowing.isDeleted;
      const toggledRelation = !relation;
      console.log('relation : ', relation, 'toggledRelation : ', toggledRelation);
      const toggleFollowing = await myFollowingDB.toggleFollowingUser(client, toggledRelation, user.id, followingUserId);
      return res.status(statusCode.OK).send(util.success(statusCode.OK, toggledRelation ? responseMessage.UNFOLLOW_SUCCESS : responseMessage.FOLLOW_SUCCESS));
    }
  } catch (error) {
    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
