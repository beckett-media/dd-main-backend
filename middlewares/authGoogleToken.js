const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = 'http://408867613518-4stgni3htds8as1g0o4ldq8sng1gng3i.apps.googleusercontent.com/';
const client = new OAuth2Client(CLIENT_ID);

const verify = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    console.log('userid----------', userid);
    return payload;
  } catch (e) {
    return {};
  }
}

module.exports = verify;
