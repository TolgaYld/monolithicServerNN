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
const { find } = require('geo-tz');


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

const getAllInvoiceAddresses = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {

            try {

                const findInWorkers = await knex(worker).where({ id: id }).returning('id');

                const findAdvertiser = await knex(advertiser).where({ id: id }).returning('id');


                if (findInWorkers.length === 0 && findAdvertiser.length === 0) {
                    next(createError(401, 'Permission denied!'));
                }
                if (findInWorkers.length !== 0 || findAdvertiser.length !== 0) {
                    try {
                        const allAddresses = await knex(invoice_address).orderBy('created_at', 'desc').returning('*');
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

const getAllMyInvoiceAddresses = async (req, res, next) => {
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
                        const allMyAddresses = await knex(invoice_address)
                            .where({
                                advertiser_id: id,
                            })
                            .orderBy('created_at', 'desc').returning('*');
                        res.json(allMyAddresses);
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

const myInvoiceAddress = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {

            try {

                const findInWorkers = await knex(worker).where({ id: id }).returning('id');

                const findAdvertiser = await knex(advertiser).where({ id: id }).returning('id');


                if (findInWorkers.length === 0 && findAdvertiser.length === 0) {
                    next(createError(401, 'Permission denied!'));
                }
                if (findInWorkers.length !== 0 || findAdvertiser.length !== 0) {
                    try {

                        const findAddress = await knex(invoice_address)
                            .where({
                                id: req.params.identifier
                            })
                            .returning('*');

                        if (findAddress.length !== 0) {
                            res.json(findAddress[0]);
                        }
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

const createInvoiceAddress = async (req, res, next) => {
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
                    if (req.body.latitude != null && id != null && req.body.country_code != null) {


                        try {
                            const createAnAddress = await knex(invoice_address).insert({
                                ...req.body,
                                advertiser_id: id,
                                timezone: await find(req.body.latitude, req.body.longitude),
                            })
                                .returning('*');

                            if (await createAnAddress.length === 0) {
                                next(createError(400, "Address not Created"))
                            } else {
                                try {
                                    await knex(address).where({ id: createAnAddress[0].address_id }).update({
                                        invoice_address_id: createAnAddress[0].id,
                                    });
                                } catch (error) {
                                    next(error);
                                }
                                res.json(createAnAddress[0]);

                            }
                        } catch (error) {
                            next(error)
                        }
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

const createInvoiceAddressInPanel = async (req, res, next) => {
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
                    if (req.body.latitude != null && id != null && req.body.country_code != null) {


                        try {
                            const createAnAddress = await knex(invoice_address).insert({
                                ...req.body,
                                timezone: await find(req.body.latitude, req.body.longitude),
                            })
                                .returning('*');

                            if (await createAnAddress.length === 0) {
                                next(createError(400, "Invoice Address not Created"))
                            } else {
                                res.json(createAnAddress[0]);

                            }
                        } catch (error) {
                            next(error)
                        }
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

const updateInvoiceAddress = async (req, res, next) => {
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

                    if (req.body.latitude != null && id != null && req.body.country_code != null) {

                        try {
                            const updatedAddress = await knex(invoice_address).where({
                                advertiser_id: id,
                                id: req.body.id
                            }).update({
                                ...req.body,
                                timezone: await find(req.body.latitude, req.body.longitude),
                                advertiser_id: id,
                                last_update_from_user_id: id,
                            })
                                .returning('*');

                            if (await updatedAddress.length === 0) {
                                next(createError(400, "Invoice Address not Updated"));
                            } else {

                                res.json(updatedAddress[0]);
                            }
                        } catch (error) {
                            next(error);
                        }
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

const updateInvoiceAddressInPanel = async (req, res, next) => {
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
                    if (req.body.longitude != null && req.body.latitude != null) {
                        try {
                            const updatedAddress = await knex(invoice_address).where({ id: req.body.id })
                                .update({
                                    ...req.body,
                                    timezone: await find(req.body.latitude, req.body.longitude),
                                    last_update_from_user_id: id
                                }).returning('*');

                            if (await updatedAddress.length === 0) {
                                next(createError(400, "Update invoice address error!"));
                            } else {
                                res.json(updatedAddress[0]);
                            }
                        } catch (error) {
                            next(error);
                        }

                    } else {
                        try {
                            const updatedAddress = await knex(invoice_address)
                                .where({
                                    id: req.body.id
                                })
                                .update({
                                    ...req.body,
                                    last_update_from_user_id: id
                                }).returning('*');

                            if (await updatedAddress.length === 0) {
                                next(createError(400, "Update invoice address error!"));
                            } else {
                                res.json(updatedAddress[0]);
                            }
                        } catch (error) {
                            next(error);
                        }
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
    getAllInvoiceAddresses,
    myInvoiceAddress,
    createInvoiceAddress,
    createInvoiceAddressInPanel,
    updateInvoiceAddress,
    updateInvoiceAddressInPanel,
    getAllMyInvoiceAddresses,
}