const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const arrayHandlers = require('../../../lib/arrayHandlers');
const { myInconvenienceDB, myChallengeDB } = require('../../../db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  const user = req.user;
  const { keyword } = req.query;

  let client;
  let result;

  try {
    client = await db.connect(req);
    const appleAccessToken =
      'eyJraWQiOiJlWGF1bm1MIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiYXVkIjoiY29tLnRlYW1aZXJvLldZQiIsImV4cCI6MTY0NTYzMDIyMSwiaWF0IjoxNjQ1NTQzODIxLCJzdWIiOiIwMDA2ODQuZjg1OTBhZTczN2Q3NGZhNWFkNGE1MTIwYjA0MzI5OTEuMTcxOCIsImNfaGFzaCI6Ii1lS3E3eHJOR2c5enBEMHRJYTJVRFEiLCJlbWFpbCI6Ink0dXJ0aWpuZmpAcHJpdmF0ZXJlbGF5LmFwcGxlaWQuY29tIiwiZW1haWxfdmVyaWZpZWQiOiJ0cnVlIiwiaXNfcHJpdmF0ZV9lbWFpbCI6InRydWUiLCJhdXRoX3RpbWUiOjE2NDU1NDM4MjEsIm5vbmNlX3N1cHBvcnRlZCI6dHJ1ZX0.kBFV4_sOkk8htweZv-A9VEBs9bWMYYuYeBeBAr1KR1ToMHxG5Ph9vGCigf0S8TUujJIN0mYI0HYY7SDpabx0uNGCip40hGclt0n6FlcYXe5J6SxeXETeznAYJrPGRs6qAowk8fbZozMK0h5xMSrmGiZLwW6CXpoYpvRvOjacx1RbxNfcjchwjF0qAXviPiIC5z_mNOPdnJQuI4GWZfwu8mpsNUD0S8WvAwcTkP2a7jS76BeG40MS7eLHYB0GYKdVr21hJrvz021whGE1BLWvghSl6M4QTKU3AzlaI1ClNqp4zHSA9AVt195ThqCtEhbpZ1L7iQCrwMd98SKJihwGzw';
    //   'eyJraWQiOiJlWGF1bm1MIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiYXVkIjoiY29tLnRlYW1aZXJvLldZQiIsImV4cCI6MTY0NTUzNDkyMSwiaWF0IjoxNjQ1NDQ4NTIxLCJzdWIiOiIwMDA2ODQuZjg1OTBhZTczN2Q3NGZhNWFkNGE1MTIwYjA0MzI5OTEuMTcxOCIsImNfaGFzaCI6Impka0FlazJLTV9TRFBBXzZfSFlMb2ciLCJlbWFpbCI6Ink0dXJ0aWpuZmpAcHJpdmF0ZXJlbGF5LmFwcGxlaWQuY29tIiwiZW1haWxfdmVyaWZpZWQiOiJ0cnVlIiwiaXNfcHJpdmF0ZV9lbWFpbCI6InRydWUiLCJhdXRoX3RpbWUiOjE2NDU0NDg1MjEsIm5vbmNlX3N1cHBvcnRlZCI6dHJ1ZX0.TzptBKRn17qfLqPe1XjEfbjX1JHKk80LOV1eVED4OoK5MHSKkkO3ND_wp0lRaqctwMUtkxFmaho4V9c4D_Jamgt5Ghl7F4lMhEe4RUwdi2Yz69GZ9w_oxIIKvTGAhNVBSK7AlDBlQPwqZ6R8kw2qug1j5Wq94n0GzfDYtycrT5JnINi6kzICJEwTN8K05Asd-Hkcss6RUYFWFXeQJ1bCLQpYqUA7Ozo0jLUeqE8Y_lE4oWT4ZvgrIBEOlE002sBIyqFPDq_RH56fQXS03lvelUu1WkqWG-Xf99d-LITI52ZR7cG92Edn-1P1_imN2svYKJp1JJWJ2SQOM_v9L7iAxQ';
    const appleUser = jwt.decode(appleAccessToken);
    console.log('appleUser : \n', appleUser);

    const myInconveniencesForBrowse = await myInconvenienceDB.getMyInconveniencesForBrowse(client, keyword);
    // console.log('myInconveniencesForBrowse', myInconveniencesForBrowse);

    // const followingUsers = await myFollowingDB.getFollowingUsers(client, user.id, keyword);
    // console.log('followings : ', followingUsers);

    const userIds = arrayHandlers.extractValues(myInconveniencesForBrowse, 'id');
    // console.log('userIds : ', userIds);

    const userChallenges = await myChallengeDB.getUsersChallenge(client, userIds);
    // console.log('userChallenges : ', userChallenges);

    const challengesForUsers = myInconveniencesForBrowse.reduce((acc, x) => {
      acc[x.id] = { user: { ...x }, challenge: {} };
      return acc;
    }, {});
    // console.log('challengesForUsers :', challengesForUsers);

    //  userId로 그룹화 해준 유저 정보들에 challenge를 넣어준다.
    userChallenges.map((o) => {
      challengesForUsers[o.userId].challenge = o;
      return o;
    });
    // console.log('challengesForUsers22 : ', challengesForUsers);

    result = Object.entries(challengesForUsers).map(([key, value]) => ({ ...value }));
    // console.log('result : ', result);

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_FOLLOWINGS_SUCCESS, result));
  } catch (error) {
    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
