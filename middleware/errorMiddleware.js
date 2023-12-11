const logger = require('../log');

const catcher = (err, req, res, next) => {

    if (err.name === "CastError") {
        logger.error(err.message);
        res.json([{
            statusCode: err.statusCode,
            message: "Invalid ID"
        }]);
    } else {
        logger.error(err.message);
        res.json([{
            statusCode: err.statusCode,
            message: err.message,
        }]);
    }
}

module.exports = catcher;