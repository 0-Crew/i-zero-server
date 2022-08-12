const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const arrayHandlers = require('../../../lib/arrayHandlers');
const { myInconvenienceDB, myChallengeDB, myFollowingDB } = require('../../../db');
const dayjs = require('dayjs');
const { now } = require('lodash');

module.exports = async (req, res) => {
  const user = req.user;
  const { keyword } = req.query;
  let { offset } = req.query;

  console.log('user', user);

  let client;
  let result;

  try {
    client = await db.connect(req);

    const myInconveniencesForBrowse = await myInconvenienceDB.getMyInconveniencesForBrowse(client, offset, keyword, user.id);
    // console.log('myInconveniencesForBrowse', myInconveniencesForBrowse);

    // const followingUsers = await myFollowingDB.getFollowingUsers(client, user.id, keyword);
    // console.log('followings : ', followingUsers);

    const userIds = arrayHandlers.extractValues(myInconveniencesForBrowse, 'id');
    // console.log('userIds : ', userIds);

    if (myInconveniencesForBrowse.length != 0) {
      const userChallenges = await myChallengeDB.getUsersChallenge(client, userIds);
      // console.log('userChallenges : ', userChallenges);

      const getFollowBackUsers = await myFollowingDB.getFollowBackUsers(client, user.id, userIds);
      // console.log('getFollowBackUsers : ', getFollowBackUsers);

      const challengesForUsers = myInconveniencesForBrowse.reduce((acc, x) => {
        acc[x.id] = { user: { ...x }, challenge: {}, follow: false };
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
      getFollowBackUsers.map((o) => {
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
      // console.log('result : ', result);
    } else {
      console.log('둘러보기 해당 user 없음');
      result = [];
    }

    return res.status(statusCode.OK).send(util.success(statusCode.OK, myInconveniencesForBrowse.length != 0 ? responseMessage.GET_BROWSE_SUCCESS : responseMessage.NO_BROWSE_RESULT, result));
  } catch (error) {
    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
