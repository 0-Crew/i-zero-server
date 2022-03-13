const jwt = require('jsonwebtoken');

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

module.exports = { appleAuth };
