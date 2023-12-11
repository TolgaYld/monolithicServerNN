const knex = require('../db/db');
const getUserId = require('../utils/getId');
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
const opening_hour = "Opening_Hour";


const getOpeningHoursForAddress = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {

            try {
                const findAdvertiser = await knex(advertiser).where({ id: id }).returning('id');
                const findInWorkers = await knex(worker).where({ id: id }).returning('id');
                const findCustomer = await knex(customer).where({ id: id }).returning('id');

                if (findInWorkers.length === 0 && findAdvertiser.length === 0 && findCustomer.length === 0) {
                    next(createError(401, 'Permission denied!'));
                }
                if (findInWorkers.length !== 0 || findAdvertiser.length !== 0 || findCustomer.length !== 0) {
                    try {
                        const findOpeningHour = await knex(opening_hour).where({
                            address_id: req.params.identifier,
                        }).returning('*');

                        if (findOpeningHour.length === 0) {
                            next(createError(400, "Opening Hour not found"))
                        } else {
                            res.json(findOpeningHour);
                        }
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

const getOpeningHours = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {

            try {
                const findAdvertiser = await knex(advertiser).where({ id: id }).returning('id');
                const findInWorkers = await knex(worker).where({ id: id }).returning('id');
                const findCustomer = await knex(customer).where({ id: id }).returning('id');

                if (findInWorkers.length === 0 && findAdvertiser.length === 0 && findCustomer.length === 0) {
                    next(createError(401, 'Permission denied!'));
                }
                if (findInWorkers.length !== 0 || findAdvertiser.length !== 0 || findCustomer.length !== 0) {
                    try {
                        const findOpeningHour = await knex(opening_hour).where({
                            advertiser_id: id,
                        })
                            .orderBy('day', 'asc')
                            .orderBy('day_from', 'desc')
                            .orderBy('time_from', 'asc')
                            .returning('*');


                        await res.json(await findOpeningHour);
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

const createOpeningHour = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER) {
        if (id == null) {

            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findAdvertiser = await knex(advertiser).where({ id: id }).returning('id');

                if (findAdvertiser.length === 0) {
                    next(createError(401, 'Permission denied!!'));
                } else {
                    const createAnOpeningHour = await knex(opening_hour).insert({
                        ...req.body,
                        advertiser_id: id
                    }).returning('*');
                    res.json(createAnOpeningHour[0]);


                }
            } catch (error) {
                next(createError(401, 'Permission denied!'));
            }
        }
    } else {
        next(createError(401, 'Permission denied!'));
    }
};

const deleteOpeningHour = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findAdvertiser = await knex(advertiser).where({ id: id }).returning('id');

                if (findAdvertiser.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    try {
                        const findOpeningHour = await knex(opening_hour).where({
                            address_id: req.body.address_id,
                            advertiser_id: id
                        }).returning('*');

                        if (findOpeningHour.length === 0) {
                            next(createError(400, "Opening Hour for Address not Exists"));
                        } else {
                            res.json(findOpeningHour[0]);

                            await knex(opening_hour).where({
                                address_id: req.body.address_id,
                                advertiser_id: id
                            }).del();

                        }
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

const createOpeningHourInPanel = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findWorker = await knex(worker).where({ id: id }).returning('id');

                if (findWorker.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    try {
                        const findOpeningHour = await knex(opening_hour).where({
                            address_id: req.body.address_id,
                            advertiser_id: req.body.advertiser_id,
                        }).returning('*');

                        if (findOpeningHour.length === 0) {
                            const createAnOpeningHour = await knex(opening_hour).insert({
                                ...req.body,
                            }).returning('*');
                            res.json(createAnOpeningHour[0]);
                        } else {
                            next(createError(400, "Opening Hour for Address Exists"))
                        }
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

const deleteOpeningHourInPanel = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findWorker = await knex(worker).where({ id: id }).returning('id');

                if (findWorker.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    try {
                        const findOpeningHour = await knex(opening_hour).where({
                            address_id: req.body.address_id,
                            advertiser_id: req.body.advertiser_id,
                        }).returning('*');

                        if (findOpeningHour.length === 0) {
                            next(createError(400, "Opening Hour for Address not Exists"));
                        } else {
                            res.json(findOpeningHour[0]);

                            await knex(opening_hour).where({
                                address_id: req.body.address_id,
                                advertiser_id: req.body.advertiser_id,
                            }).del();

                        }
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


module.exports = {
    getOpeningHoursForAddress,
    createOpeningHour,
    deleteOpeningHour,
    createOpeningHourInPanel,
    deleteOpeningHourInPanel,
    getOpeningHours,
}