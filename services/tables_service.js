const knex = require('../db/db');
const start = setTimeout(async function () {
    try {
        const knexTableExist = await knex("knex_tables").returning('*')

        if (knexTableExist.length === 0) {
            console.log('0');
        } else {
            try {
                await knex("knex_tables").del();
            } catch (error) {
                console.log(error);
            }
        }
    } catch (error) {
        console.log(error);
    }
}, 10000);

module.exports = {
    start
};