const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { notificationDB } = require('../../../db');

module.exports = async (req, res) => {
  const user = req.user;
  let client;

  try {
    client = await db.connect(req);
    const data = {};

    /**
     * my notification DB 조회
     * notification_id 로 JOIN
     * user_id, challenger_user_id 를 user table과 조인
     * is_deleted false 인 것만 조회
     *
     * 이후 나온 값들 중 현재 시간으로부터 24*7시간 안에 생성된 것만 모아 리턴
     * 24*7시간이 지난 id 값만 모아서, 해당 noti를 soft delete 해준다.
     *
     */
    return res.status(statusCode.OK).send(util.success(statusCode.OK, '내 노티 불러오기 뭐시깽이 성공', data));
  } catch (error) {
    // 서버 에러시 500 return
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
