require('dotenv').config({ quiet: true });
const jwt = require('jsonwebtoken');

// Signs a login token for `user`, stores it on the user and returns it.
// `userId` is the id to put in the token (the auth middleware reads it back as `user_id`).
const signToken = async (user, userId, duration = '20h') => {
    const token = jwt.sign(
        {
            user_id: userId,
            email: user.email
        },
        process.env.TOKEN_KEY,
        {
            expiresIn: duration,
        })
    user.accessToken = token
    await user.save()
    return token
}

module.exports = { signToken };
