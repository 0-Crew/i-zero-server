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
    const followerUsers = await myFollowingDB.getFollowerUsers(client, user.id, keyword);
    console.log('followers : ', followerUsers);

    const userIds = arrayHandlers.extractValues(followerUsers, 'id');
    console.log('userIds : ', userIds);

    if (followerUsers.length != 0) {
      const userChallenges = await myChallengeDB.getUsersChallenge(client, userIds);
      console.log('userChallenges : ', userChallenges);

      // 여기서 가져온 challenge id 들로 해당 챌린지의 inconvenience 얼마나 해결했는지 찾아야함

      const challengesForUsers = followerUsers.reduce((acc, x) => {
        acc[x.id] = { user: { ...x }, challenge: {} };
        return acc;
      }, {});
      console.log('challengesForUsers : ', challengesForUsers);

      //  userId로 그룹화 해준 유저 정보들에 challenge를 넣어준다.
      userChallenges.map((o) => {
        challengesForUsers[o.userId].challenge = o;
        return o;
      });

      console.log('challengesForUsers22 : ', challengesForUsers);
      result = Object.entries(challengesForUsers).map(([key, value]) => ({ ...value }));
    } else {
      console.log('follower 없음');
      let result = [];
    }

    return res.status(statusCode.OK).send(util.success(statusCode.OK, followerUsers.length != 0 ? responseMessage.GET_FOLLOWERS_SUCCESS : responseMessage.NO_FOLLOWERS, result));
  } catch (error) {
    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
