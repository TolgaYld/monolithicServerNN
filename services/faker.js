const knex = require('../db/db');
const { faker } = require('@faker-js/faker');

const createEntriesInDb = async function asyncIntervallDestroyAccounts() {

    for (let i = 0; i < 21; i++) {

        const name = faker.name.firstName();
        const color = faker.commerce.color();
        const allCategoriesColor = await knex("Category")
            .where({
                color
            })
            .returning('*');

        const allCategoriesName = await knex("Category")
            .where({
                name
            })
            .returning('*');

        if (allCategoriesColor.length === 0 && allCategoriesName.length === 0) {

            const createCategory = await knex("Category").insert({
                name,
                color,
                is_active: true,
            }).returning('*');

            if (createCategory.length !== 0) {
                for (let j = 0; j < 18; j++) {

                    const createSubcategory = await knex("Subcategory").insert({
                        name: faker.name.firstName(),
                        color: await createCategory[0].color,
                        is_active: true,
                        must_pick_subsubcategory: i == 2 && j == 3 ? true : false,
                        category_id: await createCategory[0].id,
                    }).returning('*');

                    if (createSubcategory.length !== 0) {
                        for (let k = 0; k < 15; k++) {
                            await knex("Subsubcategory").insert({
                                name: faker.name.firstName(),
                                color: await createCategory[0].color,
                                is_active: true,
                                category_id: await createCategory[0].id,
                                subcategory_id: await createSubcategory[0].id,
                            });
                        }
                    }
                }
            }
        }
    }
};

module.exports = {
    createEntriesInDb
} 