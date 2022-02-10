const axios = require('axios');

const authFacebookToken = async (accesstoken) => {
  try {
    const { data } = await axios({
      url: 'https://graph.facebook.com/me',
      method: 'get',
      params: {
        fields: ['id', 'first_name', 'last_name', 'email'].join(','),
        access_token: accesstoken
      },
    });
    return data;
  } catch (e) {
    return {};
  }
};

module.exports = authFacebookToken;
