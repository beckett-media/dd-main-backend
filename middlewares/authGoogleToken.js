const axios = require('axios');

const authGoogleToken = async (accesstoken) => {
  try {
    const { data } = await axios({
      url: 'https://oauth2.googleapis.com/tokeninfo',
      method: 'get',
      params: {
        id_token: accesstoken
      },
    });
    return data;
  } catch (e) {
    return {};
  }
};

module.exports = authGoogleToken;

