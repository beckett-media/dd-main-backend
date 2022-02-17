const axios = require('axios');
// https://breaking.duedilly.co/api
// http://localhost:1201/api

const breakingLiveWebhook = async (user, headers) => {
    const options = {
        url: 'https://breaking.duedilly.co/api',
        method: 'POST',
        headers: {
            'x-auth-token': headers['x-auth-token'],
            'x-app-token': headers['x-app-token']
        },
        data: {
            action: 'update_user_webhook',
            user
        }
    };
    try {
        const data = await axios(options);
        return {};
    } catch (e) {
        return {};
    }
}

module.exports = breakingLiveWebhook;
