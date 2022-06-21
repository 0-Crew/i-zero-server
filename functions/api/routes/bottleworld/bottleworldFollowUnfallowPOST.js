const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { myFollowingDB, myNotificationDB } = require('../../../db');

/*
1. 클라이언트로부터 토큰을 받아 유저의 id를 받고, body를 통해 해당 유저가 팔로우 할 유저의 id를 받아온다.
2. 해당 row 를 찾아 없다면 생성 
3. row가 이미 존재한다면 있다면 is_deleted를 토글한다. (is_deleated가 true = 언팔로우 상태, false = 팔로잉 상태) 
*/

module.exports = async (req, res) => {
  const { followingUserId } = req.body;
  const user = req.user;

  if (!followingUserId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  let client;

  try {
    client = await db.connect(req);
    const isExistFollowing = await myFollowingDB.checkFollowing(client, user.id, Number(followingUserId));

    // 처음 팔로우 하는 관계라면 row 생성
    if (!isExistFollowing) {
      await myFollowingDB.addFollowingUser(client, user.id, followingUserId);

      /**
       *  내가 받을 알림, 팔로잉하는 유저가 받을 알림 두 가지 row를 생성한다
       * */
      await myNotificationDB.addFollowingNotification(client, user.id, followingUserId);

      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.FOLLOW_SUCCESS));
    }
    // 이전에 팔로우 한 적이 있다면, 해당 row의 팔로우 여부를 isDeleted로 파악하여 설정
    const toggledRelation = !isExistFollowing.isDeleted;
    await myFollowingDB.toggleFollowingUser(client, toggledRelation, user.id, followingUserId);

    /**
     * toggledRelation의 true/false에 따라서 true일 경우앤 내가 받을 알림, 팔로잉하는 유저가 받을 알림. 이 두 row를 생성한다.
     * 취소 했다가 다시 생성한다면 새로운 row를 그냥 추가해주는걸로 작업함
     * */
    if (toggledRelation) {
      await myNotificationDB.addFollowingNotification(client, user.id, followingUserId);
    }
    return res.status(statusCode.OK).send(util.success(statusCode.OK, toggledRelation ? responseMessage.UNFOLLOW_SUCCESS : responseMessage.FOLLOW_SUCCESS));
  } catch (error) {
    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
