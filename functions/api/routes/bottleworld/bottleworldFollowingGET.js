const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const arrayHandlers = require('../../../lib/arrayHandlers');
const { myFollowingDB } = require('../../../db');

module.exports = async (req, res) => {
  const user = req.user;
  const { keyword } = req.query;

  let client;

  try {
    client = await db.connect(req);
    const followingUsers = await myFollowingDB.getFollowingUsers(client, user.id, keyword);
    console.log('followings : ', followingUsers);

    const userIds = arrayHandlers.extractValues(followingUsers, 'id');
    console.log('userIds : ', userIds);

    const userChallenges = await myFollowingDB.getUsersChallenge(client, userIds);
    console.log('userChallenges : ', userChallenges);

    const challengesForUsers = followingUsers.reduce((acc, x) => {
      acc[x.id] = { user: { ...x }, challenge: {} };
      return acc;
    }, {});
    console.log('challengesForUsers :', challengesForUsers);

    // ^_^// answerId로 그룹화 해준 answers들에 keywords를 넣어준다..
    userChallenges.map((o) => {
      challengesForUsers[o.id].challenge = o;
      return o;
    });
    console.log('challengesForUsers22 : ', challengesForUsers);

    const result = Object.entries(challengesForUsers).map(([id, data]) => ({ ...data }));
    console.log('result : ', result);

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_FOLLOWINGS_SUCCESS));
  } catch (error) {
    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
