const { signToken } = require('./token');

const sign_token = (user, duration) => signToken(user, user.customer_id, duration)

module.exports = {
    sign_token
};
