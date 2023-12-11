const knex = require('../db/db');
const getUserId = require('../utils/getId')
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const { DateTime } = require('luxon');
const fs = require('fs');
const path = require('path');
const SalesTax = require("sales-tax");
const { token, refreshToken } = require('../helpers/token');
const validator = require('validator');
const confirmEmailTemplate = require('../template/confirmEmailAdvertiserTemplate');
const resetPasswordTemplate = require('../template/resetPasswordEmailAdvertiserTemplate');
// const invoiceTemplate = require('../template/invoiceTemplate');
var createError = require('http-errors');


//Schemas
const customer = "Customer";
const advertiser = "Advertiser";
const qroffer = "QROFFER";
const address = "Address";
const invoice_address = "Invoice_Address";
const invoice = "Invoice";
const stad = "STAD"
const wallet = "Wallet_Customer";
const worker = "Worker";
const cold_call = "Cold_Call";
const favoriteAddresses = "Favorite_Addresses_Customer";
const favoriteAdvertiser = "Favorite_Advertiser_Customer";
const favoriteCategorys = "Favorite_Categorys_Customer";
const subsubCategory = "Subsubcategory";


const getAllFavoriteCategorys = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;


    if (permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {

            try {
                const findInCustomer = await knex(customer).where({ id: id }).returning('id');


                if (findInCustomer.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    try {
                        const findCategory = await knex(favoriteCategorys).where({
                            customer_id: id,
                        }).returning('*');

                        await res.json(await findCategory);

                    } catch (error) {
                        next(error);
                    }
                }
            } catch (error) {
                next(createError(401, 'Permission denied!'));
            }
        }
    } else {
        next(createError(401, 'Permission denied!'));
    }
};

const createAndDeleteFavoriteCategory = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            if (req.body.category_id != null && req.body.subcategory_id == null && req.body.subsubcategory_id == null) {
                try {
                    const findSubsubcategorys = await knex(subsubCategory).where({
                        is_active: true,
                        category_id: req.body.category_id,
                    }).returning('*');


                    try {
                        const findFavoriteCategorysTable = await knex(favoriteCategorys).where({
                            customer_id: id,
                            category_id: req.body.category_id,
                        }).returning('*');


                        if (findFavoriteCategorysTable.length === findSubsubcategorys.length) {
                            try {
                                await knex(favoriteCategorys).where({
                                    customer_id: id,
                                    category_id: req.body.category_id,
                                }).del();


                            } catch (error) {
                                next(error);
                            }

                            await res.json([{
                                "id": "deleted",
                            }]);
                            return;
                        } else {
                            try {
                                await knex(favoriteCategorys).where({
                                    customer_id: id,
                                    category_id: req.body.category_id,
                                }).del();
                            } catch (error) {
                                next(error);
                            }

                            let subSubList = findSubsubcategorys;

                            const fieldsToInsert = subSubList.map(subsub_ids =>
                                ({ customer_id: id, category_id: subsub_ids.category_id, subcategory_id: subsub_ids.subcategory_id, subsubcategory_id: subsub_ids.id }));
                            try {
                                const createFavoriteCategory = await knex(favoriteCategorys).insert(fieldsToInsert).returning('*');


                                if (createFavoriteCategory.length === 0) {
                                    throw new Error('Error: Favorite Category not created.');
                                } else {
                                    res.json(createFavoriteCategory[0]);
                                }
                            } catch (error) {
                                next(error);
                            }
                        }
                    } catch (error) {
                        next(error);
                    }
                } catch (error) {
                    next(error);
                }
            }

            if (req.body.category_id == null && req.body.subcategory_id != null && req.body.subsubcategory_id == null) {
                try {
                    const findSubsubcategorys = await knex(subsubCategory).where({
                        is_active: true,
                        subcategory_id: req.body.subcategory_id,
                    }).returning('*');


                    try {
                        const findFavoriteCategorysTable = await knex(favoriteCategorys).where({
                            customer_id: id,
                            subcategory_id: req.body.subcategory_id,
                        }).returning('*');


                        if (findFavoriteCategorysTable.length === findSubsubcategorys.length) {
                            try {
                                await knex(favoriteCategorys).where({
                                    customer_id: id,
                                    subcategory_id: req.body.subcategory_id,
                                }).del();
                            } catch (error) {
                                next(error);
                            }
                            await res.json([{
                                "id": "deleted",
                            }]);
                            return;
                        } else {
                            try {
                                await knex(favoriteCategorys).where({
                                    customer_id: id,
                                    subcategory_id: req.body.subcategory_id,
                                }).del();
                            } catch (error) {
                                next(error);
                            }

                            let subSubList = findSubsubcategorys;

                            const fieldsToInsert = subSubList.map(subsub_ids =>
                                ({ customer_id: id, category_id: subsub_ids.category_id, subcategory_id: subsub_ids.subcategory_id, subsubcategory_id: subsub_ids.id }));
                            try {
                                const createFavoriteCategory = await knex(favoriteCategorys).insert(fieldsToInsert);


                                if (createFavoriteCategory.length === 0) {
                                    throw new Error('Error: Favorite Category not created.');
                                } else {
                                    res.json(createFavoriteCategory[0]);
                                }
                            } catch (error) {
                                next(error);
                            }
                        }
                    } catch (error) {
                        next(error);
                    }
                } catch (error) {
                    next(error);
                }
            }
            if (req.body.category_id == null && req.body.subcategory_id == null && req.body.subsubcategory_id != null) {
                try {
                    const findSubsubcategorys = await knex(subsubCategory).where({
                        id: req.body.subsubcategory_id,
                        is_active: true,
                    }).returning('*');


                    try {
                        const findFavoriteCategorysTable = await knex(favoriteCategorys).where({
                            customer_id: id,
                            subsubcategory_id: req.body.subsubcategory_id,
                        }).returning('*');


                        if (findFavoriteCategorysTable.length === findSubsubcategorys.length) {
                            try {
                                await knex(favoriteCategorys).where({
                                    customer_id: id,
                                    subsubcategory_id: req.body.subsubcategory_id,
                                }).del();
                            } catch (error) {
                                next(error);
                            }
                            await res.json([{
                                "id": "deleted",
                            }]);
                            return;
                        } else {
                            try {
                                await knex(favoriteCategorys).where({
                                    customer_id: id,
                                    subsubcategory_id: req.body.subsubcategory_id,
                                }).del();
                            } catch (error) {
                                next(error);
                            }

                            let subSubList = findSubsubcategorys;

                            const fieldsToInsert = subSubList.map(subsub_ids =>
                                ({ customer_id: id, category_id: subsub_ids.category_id, subcategory_id: subsub_ids.subcategory_id, subsubcategory_id: subsub_ids.id }));
                            try {
                                const createFavoriteCategory = await knex(favoriteCategorys).insert(fieldsToInsert);


                                if (createFavoriteCategory.length === 0) {
                                    throw new Error('Error: Favorite Category not created.');
                                } else {
                                    res.json(createFavoriteCategory[0]);
                                }
                            } catch (error) {
                                next(error);
                            }
                        }
                    } catch (error) {
                        next(error);
                    }
                } catch (error) {
                    next(error);
                }
            }
        }
    } else {
        next(createError(401, 'Permission denied!'));
    }
};




module.exports = {
    getAllFavoriteCategorys,
    createAndDeleteFavoriteCategory,
}