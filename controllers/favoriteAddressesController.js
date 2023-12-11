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


const getAllFavoriteAddresses = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {

            try {
                const findInCustomer = await knex(customer).where({ id: id }).returning('id');


                if (findInCustomer.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    try {
                        const allAddresses = await knex(favoriteAddresses)
                            .where({
                                customer_id: id
                            })
                            .orderBy('created_at', 'desc')
                            .returning('*');
                        res.json(allAddresses);
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

const createAndDeleteFavoriteAddresses = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findFavoriteAddresses = await knex(favoriteAddresses).where({
                    address_id: req.body.address_id,
                    customer_id: id,
                })
                    .returning('*');

                if (findFavoriteAddresses.length === 0) {

                    try {
                        const newFavoriteAddress = await knex(favoriteAddresses).insert({
                            address_id: req.body.address_id,
                            customer_id: id
                        })
                            .returning('*');

                        if (newFavoriteAddress.length === 0) {
                            next(createError(400, 'Favorite Storeaddress Error!'));
                        } else {
                            res.json(newFavoriteAddress[0]);
                        }
                    } catch (error) {
                        next(error);
                    }
                } else {

                    try {
                        await knex(favoriteAddresses).where({
                            address_id: req.body.address_id,
                            customer_id: id,
                        }).del();


                    } catch (error) {
                        next(error);
                    }

                    res.json(findFavoriteAddresses[0]);

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
    getAllFavoriteAddresses,
    createAndDeleteFavoriteAddresses,
}