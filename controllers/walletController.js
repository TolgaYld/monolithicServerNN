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


const getMyWalletCustotmer = async (req, res, next) => {
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
                        const myWallet = await knex(qroffer)
                            .where({
                                customer_id: id,
                            })
                            .returning('*');
                        await res.json(myWallet);
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

const getMyWalletAdvertiser = async (req, res, next) => {
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
                        const myWallet = await knex(wallet)
                            .where({
                                advertiser_id: id,
                            })
                            .returning('*');
                        await res.json(myWallet);
                    } catch (error) {
                        next(createError(400, 'Bad request!: ' + error));
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

const createWallet = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;
    if (permission === process.env.PERMISSION_KEY_CUSTOMER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findInCustomers = await knex(customer).where({ id: id }).returning('id');

                if (await findInCustomers.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    try {
                        const exists = await knex(wallet).where({
                            customer_id: id,
                            qroffer_id: req.body.qroffer_id,
                        }).returning('id');

                        if (exists.length === 0) {
                            try {
                                const findQroffer = await knex(qroffer).where({
                                    id: req.body.qroffer_id,
                                    is_deleted: false,
                                    is_expired: false,
                                }).returning('*');

                                if (findQroffer.length === 0) {
                                    next(createError(404, 'Error: QROFFER not found'));
                                } else {
                                    try {
                                        const createdWallet = await knex(wallet).insert({
                                            ...req.body,
                                            customer_id: id,
                                            expiry_date: findQroffer[0].expiry_date,
                                            advertiser_id: findQroffer[0].advertiser_id,
                                            address_id: findQroffer[0].address_id,
                                        }).returning('*')


                                        if (createdWallet.length === 0) {
                                            next(createError(400, 'Error: QROFFER not added to Wallet.'));
                                        } else {
                                            try {
                                                await knex(qroffer).update({
                                                    live_qr_value: findQroffer[0].live_qr_value + 1
                                                });
                                            } catch (error) {
                                                next(error);
                                            }
                                            res.json(createdWallet[0]);
                                        }
                                    } catch (error) {
                                        next(error);
                                    }
                                }
                            } catch (error) {
                                next(error);
                            }
                        } else {
                            next(createError(406, 'QROFFER is already in Wallet.'));
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

const walletToOtherCustomer = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;
    if (permission === process.env.PERMISSION_KEY_CUSTOMER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findInCustomers = await knex(customer).where({ id: id }).returning('id');

                if (await findInCustomers.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    try {
                        const findInWallet = await knex(wallet).where({
                            customer_id: id,
                            qroffer_id: req.body.qroffer_id,
                            is_expired: false,
                            is_deleted_customer: false,
                            is_deleted_advertiser: false,
                            redeemed: false,
                            is_deleted: false,
                        }).returning('*');

                        if (findInWallet.length === 0) {
                            next(createError(400, 'Error: QROFFER-Code could not sended.'));
                        } else {
                            try {
                                const findQroffer = await knex(qroffer).where({
                                    id: req.body.qroffer_id,
                                    is_expired: false,
                                }).returning('*');

                                if (findQroffer.length === 0) {
                                    next(createError(404, 'Error: QROFFER not found'));
                                } else {
                                    try {
                                        const sendedWallet = await knex(wallet).where({
                                            customer_id: id,
                                            qroffer_id: req.body.qroffer_id,
                                            is_expired: false,
                                            is_deleted_customer: false,
                                            is_deleted_advertiser: false,
                                            redeemed: false,
                                            is_deleted: false,
                                        }).update({
                                            customer_id: req.body.customer_id
                                        }).returning('*');

                                        if (sendedWallet.length === 0) {
                                            next(createError(400, 'Error: QROFFER-Code could not sended.'));
                                        } else {
                                            res.json(sendedWallet[0]);
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

            } catch (error) {
                next(error);
            }
        }
    } else {
        next(createError(401, 'Permission denied!'));
    }
};

const deleteWalletFromCustomer = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;
    if (permission === process.env.PERMISSION_KEY_CUSTOMER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findInCustomers = await knex(customer).where({ id: id }).returning('id');

                if (await findInCustomers.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    try {
                        const deletedWallet = await knex(wallet).where({
                            customer_id: id,
                            qroffer_id: req.body.qroffer_id,
                            redeemed: false,
                            is_expired: false,
                            is_deleted_customer: false,
                            is_deleted_advertiser: false,
                            is_deleted: false
                        }).update({
                            is_deleted_customer: true,
                        }).returning('*');

                        if (deletedWallet.length === 0) {
                            next(createError(400, 'Error: Wallet not deleted.'));
                        } else {
                            try {
                                const findQroffer = await knex(qroffer).where({
                                    id: req.body.qroffer_id
                                }).returning('*');

                                if (findQroffer.length === 0) {
                                    next(createError(400, 'Error: QROFFER not founded'));
                                } else {
                                    try {
                                        await knex(qroffer).where({
                                            id: req.body.qroffer_id
                                        }).update({
                                            live_qr_value: findQroffer[0].live_qr_value - 1
                                        })
                                    } catch (error) {
                                        next(error);
                                    }
                                    await res.json(await deletedWallet[0]);
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

const redeemQroffer = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;
    if (permission === process.env.PERMISSION_KEY_ADVERTISER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findInAdvertisers = await knex(advertiser).where({ id: id }).returning('id');

                if (await findInAdvertisers.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    try {
                        const findQroffer = await knex(qroffer).where({ id: req.body.qroffer_id })
                            .returning('*');

                        if (findQroffer.length === 0) {
                            next(createError(404, 'Error: QROFFER not founded.'));
                        } else {
                            try {
                                const redeemedWallet = await knex(wallet)
                                    .where({
                                        customer_id: req.body.customer_id,
                                        qroffer_id: req.body.qroffer_id,
                                        advertiser_id: id,
                                        is_deleted_customer: false,
                                        is_deleted_advertiser: false,
                                        is_deleted: false,
                                        redeemed: false
                                    }).update({
                                        redeemed: true
                                    })
                                    .returning('*');

                                if (redeemedWallet.length === 0) {
                                    next(createError(400, 'Error: Could not redeem QROFFER.'));
                                } else {
                                    try {
                                        await knex(qroffer).where({
                                            id: req.body.qroffer_id,
                                        }).update({
                                            redeemed_qr_value: findQroffer[0].redeemed_qr_value + 1
                                        });
                                    } catch (error) {
                                        next(error);
                                    }
                                    res.json(redeemedWallet[0]);
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



module.exports = {
    getMyWalletCustotmer,
    getMyWalletAdvertiser,
    createWallet,
    walletToOtherCustomer,
    deleteWalletFromCustomer,
    redeemQroffer,
};