const axios = require('axios');

const authTwitterToken = async (accesstoken) => {
  try {
    const data = await axios({
      url: `https://api.twitter.com/oauth/authorize?oauth_token=${accesstoken}`,
      method: 'get'
    });
    return data;
  } catch (e) {
    return {};
  }
};

module.exports = authTwitterToken;
