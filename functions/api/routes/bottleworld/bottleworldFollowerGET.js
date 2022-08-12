const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const arrayHandlers = require('../../../lib/arrayHandlers');
const { myFollowingDB, myChallengeDB } = require('../../../db');

module.exports = async (req, res) => {
  const user = req.user;
  const { keyword } = req.query;
  let { offset } = req.query;
  let client;
  let result;
  let data;
  try {
    client = await db.connect(req);
    if (!offset) {
      offset = 999999;
    }

    const countFollower = await myFollowingDB.countFollower(client, user.id);
    const countFollowing = await myFollowingDB.countFollowing(client, user.id);

    const count = { follower: Number(countFollower.count), following: Number(countFollowing.count) };

    const followerUsers = await myFollowingDB.getFollowerUsers(client, user.id, offset, keyword);
    // console.log('followers : ', followerUsers);

    const userIds = arrayHandlers.extractValues(followerUsers, 'id');
    // console.log('userIds : ', userIds);

    if (followerUsers.length != 0) {
      const userChallenges = await myChallengeDB.getUsersChallenge(client, userIds);
      // console.log('userChallenges : ', userChallenges);

      const getFollowBackUsersForFollower = await myFollowingDB.getFollowBackUsers(client, user.id, userIds);
      // console.log('getFollowBackUsersForFollower : ', getFollowBackUsersForFollower);

      // 여기서 가져온 challenge id 들로 해당 챌린지의 inconvenience 얼마나 해결했는지 찾아야함
      const challengesForUsers = followerUsers.reduce((acc, x) => {
        acc[x.id] = { user: { ...x }, challenge: {}, follow: false };
        return acc;
      }, {});
      // console.log('challengesForUsers : ', challengesForUsers);

      //  userId로 그룹화 해준 유저 정보들에 challenge를 넣어준다.
      console.log('userChallenges', userChallenges);
      if (userChallenges.length != 0) {
        userChallenges.map((o) => {
          // console.log('??', o);
          challengesForUsers[o.userId].challenge = o;
          return o;
        });
      } else {
        console.log('challengesForUsers?? ', challengesForUsers);
        // delete challengesForUsers.firstname;
      }

      // followBack 여부에 따라 값을 처리해준다.
      getFollowBackUsersForFollower.map((o) => {
        if (challengesForUsers[o]) {
          challengesForUsers[o].follow = true;
          return o;
        }
      });

      result = Object.entries(challengesForUsers).map(([key, value]) => ({ ...value }));

      result.map((o) => {
        if (Object.keys(o.challenge).length === 0) {
          delete o.challenge;
        }
      });

      data = { followers: result, count };
    } else {
      console.log('follower 없음');
      data = { followers: [], count };
    }

    return res.status(statusCode.OK).send(util.success(statusCode.OK, followerUsers.length != 0 ? responseMessage.GET_FOLLOWERS_SUCCESS : responseMessage.NO_FOLLOWERS, data));
  } catch (error) {
    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
