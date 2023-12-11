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
const report = "Report";
const i_want_it_stad = "I_Want_It_STAD";
const i_want_it_qroffer = "I_Want_It_QROFFER";
const qroffer_subsubcategorys = "QROFFER_Subsubcategory";
const category = "Category";
const subCategory = "Subcategory";
const subsubCategory = "Subsubcategory";
const opening_hour = "Opening_Hour";
const stad_subsubcategorys = "STAD_Subsubcategory";
const favoriteAddresses = "Favorite_Addresses_Customer";
const favoriteCategorys = "Favorite_Categorys_Customer";


const getAllCategorys = async (req, res, next) => {
    const id = await getUserId(req);

    const permission = await req.headers.permission;
    if (permission === process.env.PERMISSION_KEY_WORKER) {

        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findInWorkers = await knex(worker).where({ id: id }).returning('id');

                if (findInWorkers.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    try {
                        const allCategorys = await knex(category)
                            .orderBy('name', 'asc')
                            .returning('*');
                        res.json(allCategorys);
                    } catch (error) {
                        next(createError(400, 'Bad request!'));
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

const getCategory = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;
    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {

            try {
                const findCustomer = await knex(customer).where({ id: id }).returning('id');

                const findInWorkers = await knex(worker).where({ id: id }).returning('id');

                const findAdvertiser = await knex(advertiser).where({ id: id }).returning('id');


                if (findInWorkers.length === 0 && findAdvertiser.length === 0 && findCustomer.length === 0) {
                    next(createError(401, 'Permission denied!'));
                }
                if (findInWorkers.length !== 0 || findAdvertiser.length !== 0 || findCustomer.length !== 0) {
                    try {
                        const oneCategory = await knex(category)
                            .where({
                                id: req.params.identifier
                            })
                            .returning('*');
                        res.json(oneCategory[0]);
                    } catch (error) {
                        next(createError(400, 'Bad request!'));
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

const getAllActiveCategorys = async (req, res, next) => {
    const permission = await req.headers.permission;
    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        try {
            const allCategorys = await knex(category)
                .orderBy('name', 'asc')
                .where({
                    is_active: true
                })
                .returning('*');
            res.json(allCategorys);
        } catch (error) {
            next(createError(400, 'Bad request!'));
        }
    } else {
        next(createError(401, 'Permission denied!'));
    }
};

const createCategory = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;
    if (permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {

            try {

                const findInWorkers = await knex(worker).where({ id: id }).returning('id');


                if (findInWorkers.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    try {
                        const createdCategory = await knex(category).insert({
                            ...req.body
                        }).returning('*');

                        if (createdCategory.length === 0) {
                            next(createError(400, "Category not created!"));
                        } else {
                            res.json(createdCategory[0]);
                        }
                    } catch (error) {
                        next(error);
                    }
                }

            } catch (error) {
                next(error);
            }
        }
    } else {
        next(createError(401, 'Permission denied!'));
    }
};

const updateCategory = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;
    if (permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {

            try {

                const findInWorkers = await knex(worker).where({ id: id }).returning('id');


                if (await findInWorkers.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    try {
                        const updatedCategory = await knex(category).update({
                            ...req.body
                        })
                            .where({
                                id: req.body.id
                            })

                        if (await updatedCategory.length === 0) {
                            next(createError(400, "Category not updated!"));
                        } else {
                            res.json(updatedCategory[0]);
                        }
                    } catch (error) {
                        next(error);
                    }
                }

            } catch (error) {
                next(error);
            }
        }
    } else {
        next(createError(401, 'Permission denied!'));
    }
};



module.exports = {
    getAllCategorys,
    getCategory,
    getAllActiveCategorys,
    createCategory,
    updateCategory,
}