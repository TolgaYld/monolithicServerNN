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
const wallet = "Wallet_Customer";
const worker = "Worker";


const getAllIwantIts = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {

            try {
                const findInCustomer = await knex(customer).where({ id: id }).returning('id');

                const findInWorkers = await knex(worker).where({ id: id }).returning('id');

                const findAdvertiser = await knex(advertiser).where({ id: id }).returning('id');


                if (findInWorkers.length === 0 && findAdvertiser.length === 0 && findInCustomer.length === 0) {
                    next(createError(401, 'Permission denied!'));
                }
                if (findInWorkers.length !== 0 || findAdvertiser.length !== 0 || findInCustomer.length !== 0) {
                    try {
                        const allQroffer = await knex(i_want_it_qroffer)
                            .returning('*');
                        res.json(allQroffer);
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

const getAllIwantItsForOneQroffer = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {

            try {
                const findInCustomer = await knex(customer).where({ id: id }).returning('id');

                const findInWorkers = await knex(worker).where({ id: id }).returning('id');

                const findAdvertiser = await knex(advertiser).where({ id: id }).returning('id');


                if (findInWorkers.length === 0 && findAdvertiser.length === 0 && findInCustomer.length === 0) {
                    next(createError(401, 'Permission denied!'));
                }
                if (findInWorkers.length !== 0 || findAdvertiser.length !== 0 || findInCustomer.length !== 0) {
                    try {
                        const allQroffer = await knex(i_want_it_qroffer)
                            .where({
                                qroffer_id: req.params.identifier
                            })
                            .returning('*');
                        res.json(allQroffer);
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

const iWantItQrofferMe = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_CUSTOMER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findCustomer = await knex(customer).where({ id: id }).returning('id');

                if (findCustomer.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {

                    try {
                        const findIWantIt = await knex(i_want_it_qroffer)
                            .where({
                                customer_id: id,
                                qroffer_id: req.params.identifier
                            })
                            .returning('*');

                        if (findIWantIt.length !== 0) {
                            res.json(findIWantIt[0]);
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

const createAndDeleteIWantItQroffer = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_CUSTOMER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findCustomer = await knex(customer).where({ id: id }).returning('id');

                if (findCustomer.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    try {
                        const findIWantItqr = await knex(i_want_it_qroffer).where({
                            customer_id: id,
                            qroffer_id: req.body.qroffer_id
                        }).returning('id');


                        if (findIWantItqr.length === 0) {
                            try {
                                const createIWantItQr = await knex(i_want_it_qroffer).insert({
                                    customer_id: id,
                                    qroffer_id: req.body.qroffer_id
                                }).returning('*');


                                if (createIWantItQr.length === 0) {
                                    next(createError(400, "Error: Create I want it qroffer"));
                                } else {
                                    res.json(createIWantItQr[0]);
                                }
                            } catch (error) {
                                next(error);
                            }
                        } else {
                            try {
                                await knex(i_want_it_qroffer).where({
                                    customer_id: id,
                                    qroffer_id: req.body.qroffer_id
                                }).del();
                            } catch (error) {
                                next(error);
                            }

                            res.json(findIWantItqr[0]);
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
    getAllIwantIts,
    iWantItQrofferMe,
    createAndDeleteIWantItQroffer,
    getAllIwantItsForOneQroffer,
}