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


const getAllSubcategorys = async (req, res, next) => {
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
                        const allSubcategorys = await knex(subCategory)
                            .orderBy('name', 'asc')
                            .returning('*');
                        res.json(allSubcategorys);
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

const getAllActiveSubcategorys = async (req, res, next) => {
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {


        try {
            const allSubcategorys = await knex(subCategory)
                .where({
                    is_active: true,
                })
                .orderBy('name', 'asc')
                .returning('*');
            res.json(allSubcategorys);
        } catch (error) {
            next(createError(400, 'Bad request!'));
        }
    } else {
        next(createError(401, 'Permission denied!'));
    }
};

const getSubcategory = async (req, res, next) => {
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
                        const oneSubcategory = await knex(subCategory)
                            .where({
                                id: req.params.identifier
                            })
                            .returning('*');
                        res.json(oneSubcategory[0]);
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

const getAllActiveSubcategorysFromCategory = async (req, res, next) => {
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        try {
            const allActiveSubcategorys = await knex(subCategory)
                .orderBy('name', 'asc')
                .where({
                    is_active: true,
                    category_id: req.params.identifier
                })
                .returning('*');
            res.json(allActiveSubcategorys);
        } catch (error) {
            next(createError(400, 'Can not get Subcategorys!'));
        }
    } else {
        next(createError(401, 'Permission denied!'));
    }
};

const createSubcategory = async (req, res, next) => {
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
                        const createdSubcategory = await knex(subCategory).insert({
                            ...req.body
                        }).returning('*');

                        if (createdSubcategory.length === 0) {
                            next(createError(400, 'Error: Subcategory not created!'));
                        } else {
                            res.json(createdSubcategory[0]);
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

const updateSubcategory = async (req, res, next) => {
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
                        const findSubcategory = await knex(subCategory).where({
                            id: req.params.identifier,
                        }).returning('*')

                        if (findSubcategory.length === 0) {
                            next(createError(404, 'Error: Subcategory not found.'));
                        } else {
                            try {
                                const updatedSubcategory = await knex(subCategory).where({
                                    id: req.params.identifier,
                                }).update({
                                    ...req.body,
                                    last_update_from_user_id: id,
                                }).returning('*');

                                if (updatedSubcategory.length === 0) {
                                    next(createError(400, 'Error: Subcategory not updated'));
                                } else {
                                    res.json(updatedSubcategory[0]);
                                }
                            } catch (error) {
                                next(error);
                            }
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

const createSubcategorySuggestion = async (req, res, next) => {
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER) {
        try {
            const createdSubcategory = await knex(subCategory).insert({
                name: req.body.name,
                category_id: req.body.category_id
            }).returning('*');

            if (createdSubcategory.length === 0) {
                next(createError(400, 'Error: Subcategory not created!'));
            } else {
                res.json(createdSubcategory[0]);
            }
        } catch (error) {
            next(error);
        }
    } else {
        next(createError(401, 'Permission denied!'));
    }
};





module.exports = {
    getAllSubcategorys,
    getSubcategory,
    getAllActiveSubcategorysFromCategory,
    createSubcategory,
    updateSubcategory,
    createSubcategorySuggestion,
    getAllActiveSubcategorys,
};