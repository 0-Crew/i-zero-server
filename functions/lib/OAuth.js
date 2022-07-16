const jwt = require('jsonwebtoken');
const axios = require('axios');
const responseMessage = require('../constants/responseMessage');

const appleAuth = async (appleAccessToken) => {
  console.log('🔑 Apple 유저 정보 확인 🔑');

  try {
    const appleUser = jwt.decode(appleAccessToken);
    if (appleUser.email_verified == 'false') return null;

    return appleUser;
  } catch (err) {
    return null;
  }
};

const kakaoAuth = async (kakaoAccessToken) => {
  console.log('🔑 Kakao 유저 정보 확인 🔑');

  try {
    const user = await axios({
      method: 'GET',
      url: 'https://kapi.kakao.com/v2/user/me',
      headers: {
        Authorization: 'Bearer ' + kakaoAccessToken,
        'Content-Type': 'application/json',
      },
    });

    const kakaoUser = user.data.kakao_account;
    console.log('카카오 유저다~~~ ', kakaoUser);
    if (!kakaoUser) return responseMessage.NOT_INCLUDE_EMAIL;
    if (!kakaoUser.is_email_valid || !kakaoUser.is_email_verified) return responseMessage.INVALID_USER;

    return kakaoUser;
  } catch (err) {
    return null;
  }
};

module.exports = { appleAuth, kakaoAuth };
