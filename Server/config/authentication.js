const { signToken } = require('./token');

const sign_token = (user, duration) => signToken(user, user.user_id, duration)

module.exports = {
    sign_token
};
