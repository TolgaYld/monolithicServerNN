const jwt = require('jsonwebtoken');

const token = {
    generate: ({ id }, expiresIn) => {
        return jwt.sign({
            id,
        }, process.env.SECRET_KEY, { expiresIn });
    }
};

const refreshToken = {
    generate: ({ id }, expiresIn) => {
        return jwt.sign({
            id,
        }, process.env.SECRET_KEY_REFRESH, { expiresIn });
    }
};


module.exports = { token, refreshToken };