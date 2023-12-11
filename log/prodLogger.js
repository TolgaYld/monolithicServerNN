const { createLogger, format, transports } = require('winston');
const { timestamp, combine, errors, json } = format;

function buildProdLogger() {



    return createLogger({
        level: 'info',
        format: combine(
            timestamp(),
            errors({ stack: true }),
            json(),
        ),
        defaultMeta: { service: 'user-service' },
        transports: [
            new transports.Console(),
            new transports.File({ filename: './log/files/prod/prodLog.log' })
        ],
    });
};

module.exports = buildProdLogger;