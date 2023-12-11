const knex = require('knex');
const knexfile = require('./knexfile');

let db = null;

if (process.env.NODE_ENV === 'development') {
    db = knex(knexfile.development);
}

if (process.env.NODE_ENV === 'production') {
    db = knex(knexfile.production);
}


module.exports = db;