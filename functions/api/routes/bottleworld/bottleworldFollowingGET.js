const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const arrayHandlers = require('../../../lib/arrayHandlers');
const { myFollowingDB, myChallengeDB } = require('../../../db');

module.exports = async (req, res) => {
  const user = req.user;
  const { keyword } = req.query;

  let client;
  let result;
  try {
    client = await db.connect(req);
    const followingUsers = await myFollowingDB.getFollowingUsers(client, user.id, keyword);
    // console.log('followings : ', followingUsers);

    if (followingUsers.length != 0) {
      const userIds = arrayHandlers.extractValues(followingUsers, 'id');
      // console.log('userIds : ', userIds);

      const userChallenges = await myChallengeDB.getUsersChallenge(client, userIds);
      // console.log('userChallenges : ', userChallenges);

      const getFollowBackUsersForFollowing = await myFollowingDB.getFollowBackUsersForFollowing(client, user.id, userIds);
      // console.log('getFollowBackUsersForFollowing : ', getFollowBackUsersForFollowing);

      const challengesForUsers = followingUsers.reduce((acc, x) => {
        acc[x.id] = { user: { ...x }, challenge: {}, followBack: false };
        return acc;
      }, {});
      // console.log('challengesForUsers :', challengesForUsers);

      //  userId로 그룹화 해준 유저 정보들에 challenge를 넣어준다.
      userChallenges.map((o) => {
        challengesForUsers[o.userId].challenge = o;
        return o;
      });
      // console.log('challengesForUsers22 : ', challengesForUsers);

      // followBack 여부에 따라 값을 처리해준다.
      getFollowBackUsersForFollowing.map((o) => {
        if (challengesForUsers[o]) {
          challengesForUsers[o].followBack = true;
          return o;
        }
      });

      result = Object.entries(challengesForUsers).map(([key, value]) => ({ ...value }));
      // console.log('result : ', result);
    } else {
      console.log('following 없음 ');
      result = [];
    }

    return res.status(statusCode.OK).send(util.success(statusCode.OK, followingUsers.length != 0 ? responseMessage.GET_FOLLOWINGS_SUCCESS : responseMessage.NO_FOLLOWINGS, result));
  } catch (error) {
    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
