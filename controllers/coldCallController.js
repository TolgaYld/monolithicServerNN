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


const getAllColdCalls = async (req, res, next) => {
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
                        const allColdCalls = await knex(cold_call)
                            .orderBy('created_at', 'desc')
                            .returning('*');
                        res.json(allColdCalls);
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

const getColdCall = async (req, res, next) => {
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
                        const onceColdCall = await knex(cold_call)
                            .where({
                                id: req.params.identifier
                            })
                            .returning('*');
                        res.json(onceColdCall[0]);
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

const createColdCall = async (req, res, next) => {
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
                        const createdColdCall = await knex(cold_call)
                            .insert({
                                ...req.body
                            })
                            .returning('*');
                        res.json(createdColdCall[0]);
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

const updateColdCall = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;
    if (permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findColdCall = await knex(cold_call).where({
                    id: req.params.identifier,
                }).returning('*')

                if (await findColdCall.length === 0) {
                    next(createError(404, 'Cold Call not found!'));
                } else {
                    try {
                        const updatedColdCall = await knex(cold_call).where({
                            id: req.params.identifier
                        }).update({
                            ...req.body,
                            last_update_from_user_id: id,
                        }).returning('*');

                        if (await updatedColdCall.length === 0) {
                            next(createError(400, 'Cold Call update failed.'));
                        } else {
                            res.json(updatedColdCall[0]);
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
    getAllColdCalls,
    getColdCall,
    createColdCall,
    updateColdCall,
}