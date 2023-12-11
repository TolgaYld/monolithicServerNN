const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' });

const getUserId = async (req, requireAuth = true) => {
    const header = await req.headers.authorization;

    if (header) {
        try {
            const token = await header.split(' ')[1];    //split or u can use replace('Bearer', '')
            const decoded = await jwt.verify(token, process.env.SECRET_KEY);
            return await decoded.id;
        } catch (e) {
            console.log(e);
        }
    }
    if (requireAuth) {
        console.log('Authentication required!');
    }


    return null;
}

module.exports = getUserId