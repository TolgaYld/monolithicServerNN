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
const axios = require('axios').default;


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
const subSub_Qroffer = "QROFFER_Subsubcategory";
const subSub_Stad = "STAD_Subsubcategory";

const getMyActiveStad = async (req, res, next) => {
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
                        const activeStad = await knex(stad)
                            .where({
                                is_active: true,
                                is_banned: false,
                                is_deleted: false,
                                advertiser_id: id
                            }).returning('*');
                        res.json(activeStad[0]);
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

const getMyStads = async (req, res, next) => {
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
                        const myStads = await knex(stad)
                            .where({
                                completely_deleted: false,
                                is_banned: false,
                                advertiser_id: id
                            }).returning('*');
                        res.json(myStads);
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

const oneStad = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {

            try {

                const findInWorkers = await knex(worker).where({ id: id }).returning('id');
                const findCustomer = await knex(customer).where({ id: id }).returning('id');
                const findAdvertiser = await knex(advertiser).where({ id: id }).returning('id');


                if (findInWorkers.length === 0 && findAdvertiser.length === 0 && findCustomer.length === 0) {
                    next(createError(401, 'Permission denied!'));
                }
                if (findInWorkers.length !== 0 || findAdvertiser.length !== 0 || findCustomer.length !== 0) {
                    try {

                        const findStad = await knex(stad)
                            .where({
                                id: req.params.identifier,
                            })
                            .orderBy('created_at', 'desc')
                            .returning('*');

                        if (findStad.length !== 0) {
                            res.json(findStad[0]);
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

const oneInactiveStad = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {

            try {

                const findInWorkers = await knex(worker).where({ id: id }).returning('id');
                const findCustomer = await knex(customer).where({ id: id }).returning('id');
                const findAdvertiser = await knex(advertiser).where({ id: id }).returning('id');


                if (findInWorkers.length === 0 && findAdvertiser.length === 0 && findCustomer.length === 0) {
                    next(createError(401, 'Permission denied!'));
                }
                if (findInWorkers.length !== 0 || findAdvertiser.length !== 0 || findCustomer.length !== 0) {
                    try {

                        const findStad = await knex(stad)
                            .where({
                                id: req.params.identifier,
                                is_banned: false,
                                is_deleted: false,
                                completely_deleted: false
                            })
                            .orderBy('created_at', 'desc')
                            .returning('*');

                        if (findStad.length !== 0) {
                            res.json(findStad[0]);
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

const allStads = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {

            try {
                const findWorker = await knex(worker).where({ id: id }).returning('id');


                if (findWorker.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    try {

                        const findAllStads = await knex(stad)
                            .orderBy('created_at', 'desc')
                            .returning('*');

                        if (findAddresses.length !== 0) {
                            res.json(findAllStads);
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

const createStad = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findAdvertiser = await knex(advertiser).where({ id: id }).returning('*');

                if (findAdvertiser.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    const beginArgs = await req.body.begin;
                    const endArgs = await req.body.end;
                    try {
                        const newStadIsBeforeBeginAndEndingAfterBegin = await knex(stad).where({
                            address_id: req.body.address_id,
                            is_deleted: false,
                            is_archive: false,
                            completely_deleted: false,
                            advertiser_id: id,
                        })
                            .whereBetween('begin', [beginArgs, endArgs])
                            .returning('id');

                        try {
                            const newStadIsBetweenAnExistingStad = await knex(stad).where({
                                address_id: req.body.address_id,
                                is_deleted: false,
                                is_archive: false,
                                completely_deleted: false,
                                advertiser_id: id,
                            })
                                .where('begin', '<=', beginArgs)
                                .where('end', '>=', endArgs)
                                .returning('id');

                            try {
                                const newStadIsAfterBeginAndEndingAfterEnd = await knex(stad).where({
                                    address_id: req.body.address_id,
                                    is_deleted: false,
                                    is_archive: false,
                                    completely_deleted: false,
                                    advertiser_id: id,
                                })
                                    .whereBetween('end', [beginArgs, endArgs])
                                    .returning('id');


                                if (newStadIsAfterBeginAndEndingAfterEnd.length === 0 && newStadIsBeforeBeginAndEndingAfterBegin.length === 0 && newStadIsBetweenAnExistingStad.length === 0) {

                                    try {
                                        const findAddress = await knex(address).where({
                                            id: req.body.address_id,
                                        })
                                            .returning('*');

                                        if (findAddress.length === 0) {
                                            next(createError(400, 'Error: STAD could not created.'));
                                        } else {
                                            if (!findAddress[0].is_active) {
                                                next(createError(406, "Address is not activated."));
                                            } else {
                                                let salesTax = await SalesTax.getSalesTax(findAddress[0].country_code);
                                                let rate = await salesTax.rate
                                                let taxPrice = req.body.price != 0 ? (req.body.price * rate).toFixed(2) : 0;
                                                taxPrice = parseFloat(taxPrice);
                                                let gross = (req.body.price + taxPrice).toFixed(2);
                                                gross = parseFloat(taxPrice);
                                                try {
                                                    const subsubcategoryList = req.body.subsubcategorys;
                                                    delete req.body.subsubcategorys;
                                                    const newStad = await knex(stad).insert({
                                                        ...req.body,
                                                        category_id: findAddress[0].category_id,
                                                        subcategory_id: findAddress[0].subcategory_id,
                                                        invoice_address_id: findAddress[0].invoice_address_id,
                                                        latitude: findAddress[0].latitude,
                                                        longitude: findAddress[0].longitude,
                                                        advertiser_id: id,
                                                        tax_price: taxPrice,
                                                        gross: gross
                                                    }).returning('*');

                                                    if (newStad.length === 0) {
                                                        next(createError(400, 'Error: STAD could not created.'));
                                                    } else {


                                                        let subSubList = subsubcategoryList;

                                                        const fieldsToInsert = subSubList.map(subsub_ids =>
                                                            ({ stad_id: newStad[0].id, subsubcategory_id: subsub_ids }));
                                                        try {
                                                            const stadsInSubsubcategorysTable = await knex(subSub_Stad).insert(fieldsToInsert).returning('id');

                                                            if (stadsInSubsubcategorysTable.length === 0) {
                                                                throw new Error('Subsubcategory Error.');
                                                            } else {
                                                                await res.json(newStad[0]);


                                                            }
                                                        } catch (error) {
                                                            next(error);
                                                        }
                                                    }
                                                } catch (error) {
                                                    next(error);
                                                }
                                            }
                                        }
                                    } catch (error) {
                                        next(error);
                                    }
                                } else {
                                    next(createError(406, 'You have already a STAD in your choosen Time-Span.'));
                                }
                            } catch (error) {
                                next(error);
                            }
                        } catch (error) {
                            next(error);
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

const updateStad = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findInAdvertisers = await knex(advertiser).where({ id: id }).returning('id');
                if (findInAdvertisers.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    try {
                        const findStad = await knex(stad).where({
                            id: req.body.id,
                            advertiser_id: id,
                            is_banned: false,
                            is_deleted: false,
                        }).returning('*');

                        if (findStad.length === 0) {
                            next(createError(404, "Can not find STAD"));
                        } else {
                            const beginTime = DateTime.fromJSDate(findStad[0].begin);
                            if (DateTime.now().toUTC().diff(beginTime, 'minutes').minutes < 6 || findStad[0].is_archive) {
                                const beginArgs = await req.body.begin;
                                const endArgs = await req.body.end;
                                try {
                                    const newStadIsBeforeBeginAndEndingAfterBegin = await knex(stad).where({
                                        address_id: req.body.address_id,
                                        is_deleted: false,
                                        is_archive: false,
                                        completely_deleted: false,
                                        advertiser_id: id,
                                    })
                                        .whereNot({
                                            id: req.body.id
                                        })
                                        .whereBetween('begin', [beginArgs, endArgs])
                                        .returning('id');

                                    try {
                                        const newStadIsBetweenAnExistingStad = await knex(stad).where({
                                            address_id: req.body.address_id,
                                            is_deleted: false,
                                            is_archive: false,
                                            completely_deleted: false,
                                            advertiser_id: id,
                                        })
                                            .whereNot({
                                                id: req.body.id
                                            })
                                            .where('begin', '<=', beginArgs)
                                            .where('end', '>=', endArgs)
                                            .returning('id');

                                        try {
                                            const newStadIsAfterBeginAndEndingAfterEnd = await knex(stad).where({
                                                address_id: req.body.address_id,
                                                is_deleted: false,
                                                is_archive: false,
                                                completely_deleted: false,
                                                advertiser_id: id,
                                            })
                                                .whereNot({
                                                    id: req.body.id
                                                })
                                                .whereBetween('end', [beginArgs, endArgs])
                                                .returning('id');



                                            if (newStadIsAfterBeginAndEndingAfterEnd.length === 0 && newStadIsBeforeBeginAndEndingAfterBegin.length === 0 && newStadIsBetweenAnExistingStad.length === 0) {

                                                try {
                                                    const findAddress = await knex(address).where({ id: req.body.address_id }).returning('*');

                                                    if (findAddress.length === 0) {

                                                        next(createError(404, 'Error: Storeaddress not found.'));
                                                    } else {
                                                        let salesTax = await SalesTax.getSalesTax(findAddress[0].country_code);
                                                        let rate = await salesTax.rate;
                                                        let taxPrice = req.body.price != 0 ? (req.body.price * rate).toFixed(2) : 0;
                                                        taxPrice = parseFloat(taxPrice);
                                                        let gross = (req.body.price + taxPrice).toFixed(2);
                                                        gross = parseFloat(taxPrice);
                                                        try {
                                                            const subsubcategoryList = req.body.subsubcategorys;
                                                            delete req.body.subsubcategorys;
                                                            const updatedStad = await knex(stad).where({
                                                                id: req.body.id,
                                                                advertiser_id: id,
                                                                is_banned: false,
                                                                is_deleted: false,
                                                            })
                                                                .update({
                                                                    ...req.body,
                                                                    is_active: false,
                                                                    tax_price: taxPrice,
                                                                    gross: gross,
                                                                    last_update_from_user_id: id
                                                                }).returning('*');

                                                            if (updatedStad.length === 0) {

                                                                next(createError(400, 'Update STAD error.'));
                                                            } else {

                                                                try {
                                                                    await knex(subSub_Stad).where({ stad_id: req.body.id }).del();
                                                                } catch (error) {
                                                                    console.log(error);
                                                                }
                                                                let subSubList = subsubcategoryList;

                                                                const fieldsToInsert = subSubList.map(subsub_ids =>
                                                                    ({ stad_id: updatedStad[0].id, subsubcategory_id: subsub_ids }));


                                                                try {
                                                                    const stadsInSubsubcategorysTable = await knex(subSub_Stad).insert(fieldsToInsert).returning('id');

                                                                    if (stadsInSubsubcategorysTable.length === 0) {
                                                                        next(createError(400, 'Subsubcategory Error.'));
                                                                    } else {
                                                                        res.json(updatedStad[0]);
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
                                            } else {
                                                next(createError(406, 'You have already a STAD in your choosen Time-Span.'));
                                            }
                                        } catch (error) {
                                            next(error);
                                        }
                                    } catch (error) {
                                        next(error);
                                    }
                                } catch (error) {
                                    next(error);
                                }
                            } else {
                                next(createError(406, "Update: Time to update is expired."));
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

const updateStadInPanel = async (req, res, next) => {
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
                    const beginArgs = await req.body.begin;
                    const endArgs = await req.body.end;
                    try {
                        const newStadIsBeforeBeginAndEndingAfterBegin = await knex(stad).where({
                            address_id: req.body.address_id,
                            is_deleted: false,
                            completely_deleted: false,
                            advertiser_id: req.body.advertiser_id,
                        })
                            .whereNot({
                                id: req.body.id
                            })
                            .whereBetween('begin', [beginArgs, endArgs])
                            .returning('id');

                        try {
                            const newStadIsBetweenAnExistingStad = await knex(stad).where({
                                address_id: req.body.address_id,
                                is_deleted: false,
                                completely_deleted: false,
                                advertiser_id: req.body.advertiser_id,
                            })
                                .whereNot({
                                    id: req.body.id
                                })
                                .where('begin', '<=', beginArgs)
                                .where('end', '>=', endArgs)
                                .returning('id');

                            try {
                                const newStadIsAfterBeginAndEndingAfterEnd = await knex(stad).where({
                                    address_id: req.body.address_id,
                                    is_deleted: false,
                                    completely_deleted: false,
                                    advertiser_id: req.body.advertiser_id,
                                })
                                    .whereNot({
                                        id: req.body.id
                                    })
                                    .whereBetween('end', [beginArgs, endArgs])
                                    .returning('id');


                                if (newStadIsAfterBeginAndEndingAfterEnd.length === 0 && newStadIsBeforeBeginAndEndingAfterBegin.length === 0 && newStadIsBetweenAnExistingStad.length === 0) {

                                    try {
                                        const findAddress = await knex(address).where({ id: req.body.address_id }).returning('*');

                                        if (findAddress.length === 0) {

                                            next(createError(404, 'Error: Storeaddress not found.'));
                                        } else {
                                            let salesTax = await SalesTax.getSalesTax(findAddress[0].country_code);
                                            let rate = await salesTax.rate;
                                            let taxPrice = req.body.price != 0 ? (req.body.price * rate).toFixed(2) : 0;
                                            taxPrice = parseFloat(taxPrice);
                                            let gross = (req.body.price + taxPrice).toFixed(2);
                                            gross = parseFloat(taxPrice);
                                            try {
                                                const subsubcategoryList = req.body.subsubcategorys;
                                                delete req.body.subsubcategorys;
                                                const updatedStad = await knex(stad).where({ id: req.body.id })
                                                    .update({
                                                        ...req.body,
                                                        tax_price: taxPrice,
                                                        gross: gross,
                                                        last_update_from_user_id: id
                                                    }).returning('*');

                                                if (updatedStad.length === 0) {
                                                    next(createError(400, 'Update STAD error.'));
                                                } else {

                                                    try {
                                                        await knex(subSub_Stad).where({ stad_id: req.body.stad_id }).del();
                                                    } catch (error) {
                                                        next(error);
                                                    }
                                                    let subSubList = subsubcategoryList;

                                                    const fieldsToInsert = subSubList.map(subsub_ids =>
                                                        ({ stad_id: updatedStad[0].id, subsubcategory_id: subsub_ids }));
                                                    try {
                                                        const stadsInSubsubcategorysTable = await knex(subSub_Stad).insert(fieldsToInsert).returning('id');

                                                        if (stadsInSubsubcategorysTable.length === 0) {
                                                            next(createError(400, 'Subsubcategory Error.'));
                                                        } else {
                                                            res.json(updatedStad[0]);
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
                                } else {
                                    next(createError(406, 'Advertiser have already a STAD in your choosen Time-Span.'));
                                }
                            } catch (error) {
                                next(error);
                            }
                        } catch (error) {
                            next(error);
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

const deleteStadCompletely = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findInAdvertisers = await knex(advertiser).where({ id: id }).returning('id');
                if (findInAdvertisers.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    try {
                        const deletedStad = await knex(stad)
                            .where({
                                id: req.body.id,
                                advertiser_id: id,
                                is_deleted: true
                            })
                            .update({
                                completely_deleted: true,
                                last_update_from_user_id: id
                            })
                            .returning('*')

                        if (deletedStad.length === 0) {
                            next(createError(400, 'Update STAD error.'));
                        } else {
                            res.json(deletedStad[0]);
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

const deleteStad = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {

                const findInAdvertisers = await knex(advertiser).where({ id: id }).returning('id');

                if (findInAdvertisers.length === 0) {

                    next(createError(401, 'Permission denied!'));
                } else {
                    try {
                        const findStad = await knex(stad).where({
                            id: req.body.id,
                            advertiser_id: id,
                            is_banned: false,
                            is_deleted: false
                        }).returning('*');

                        if (findStad.length === 0) {
                            next(createError(400, 'Error: STAD could not deleted.'));
                        } else {
                            try {
                                const findAddress = await knex(address).where({
                                    id: findStad[0].address_id,
                                    advertiser_id: id,
                                }).returning('*');
                                if (findAddress.length === 0) {
                                    next(createError(400, 'Error: STAD could not deleted.'));
                                } else {
                                    try {
                                        let salesTax = await SalesTax.getSalesTax(findAddress[0].country_code);
                                        let rate = await salesTax.rate;
                                        let taxPrice = req.body.price != 0 ? (req.body.price * rate).toFixed(2) : 0;
                                        taxPrice = parseFloat(taxPrice);
                                        let gross = (req.body.price + taxPrice).toFixed(2);
                                        gross = parseFloat(taxPrice);
                                        const now = DateTime.now().toUTC();
                                        const beginTime = DateTime.fromJSDate(findStad[0].begin);

                                        const deletedStad = await knex(stad).where({
                                            id: req.body.id,
                                            advertiser_id: id,
                                            is_banned: false,
                                            is_deleted: false
                                        }).update({
                                            is_deleted: true,
                                            is_active: false,
                                            tax_price: taxPrice,
                                            price: req.body.price,
                                            gross: gross,
                                            begin: now < beginTime ? now.toISO().toString() : beginTime.toISO().toString(),
                                            end: now.toISO().toString(),
                                            last_update_from_user_id: id,
                                        }).returning('*');


                                        if (deletedStad.length === 0) {
                                            next(createError(400, 'Error: STAD could not deleted.'));
                                        } else {
                                            try {
                                                await knex(address).where({ id: deletedStad[0].address_id }).update({
                                                    active_stad: false,
                                                    last_update_from_user_id: id
                                                });
                                            } catch (error) {
                                                next(error);
                                            }
                                            try {
                                                await knex(subSub_Stad).where({ stad_id: deletedStad[0].id }).update({
                                                    is_deleted: true,
                                                    is_active: false,
                                                    last_update_from_user_id: id
                                                });
                                            } catch (error) {
                                                next(error);
                                            }

                                            res.json(deletedStad[0]);


                                            // try {
                                            //     const requestSevdeskUser = await axios.request({
                                            //         method: "GET",
                                            //         url: process.env.SEVDESK_HTTPS_ENDPOINT + '/SevUser', data,
                                            //         headers: {
                                            //             'Content-Type': 'application/json',
                                            //             Authorization: process.env.SEVDESK_API_TOKEN.toString(),
                                            //         }
                                            //     });


                                            //     let list = await requestSevdeskUser.data["objects"];


                                            //     const data = {
                                            //         "invoice": {
                                            //             "contact": {
                                            //                 "id": await findAdvertiser[0].sevdesk_id,
                                            //                 "objectName": "Contact",
                                            //             },
                                            //             "invoiceDate": DateTime.now().toFormat("dd.MM.yyyy"),
                                            //             "discount": 0,
                                            //             "deliveryDate": beginArgs,
                                            //             "deliveryDateUntil": endArgs,
                                            //             "status": 200,
                                            //             "smallSettlement": 0,
                                            //             "contactPerson": {
                                            //                 "id": await list[0].id,
                                            //                 "objectName": "SevUser"
                                            //             },
                                            //             "taxRate": rate,
                                            //             "taxText": "Umsatzsteuer",
                                            //             "invoiceType": "RE",
                                            //             "address": await findAddress[0].name + "\n" + await findAddress[0].street + "\n" + await findAddress[0].postcode + " " + await findAddress[0].city + "\n" + await findAddress[0].country,
                                            //             "currency": "EUR",
                                            //             "showNet": false,
                                            //             "mapAll": true,
                                            //             "objectName": "Invoice"
                                            //         },
                                            //         "invoicePosSave": [
                                            //             {
                                            //                 "quantity": 1,
                                            //                 "name": "Dragonglass",
                                            //                 "unity": {
                                            //                     "id": 1,
                                            //                     "objectName": "Unity"
                                            //                 },
                                            //                 "taxRate": rate,
                                            //                 "priceGross": parseFloat(gross),
                                            //                 "priceTax": parseFloat(taxPrice),
                                            //                 "mapAll": true,
                                            //                 "objectName": "InvoicePos"
                                            //             }
                                            //         ],
                                            //         "invoicePosDelete": null,
                                            //         "discountSave": null,
                                            //         "discountDelete": null,
                                            //         "takeDefaultAddress": false,
                                            //     };

                                            //     try {
                                            //         await axios.request({
                                            //             method: "POST",
                                            //             url: process.env.SEVDESK_HTTPS_ENDPOINT + '/Invoice/Factory/saveInvoice', data,
                                            //             headers: {
                                            //                 'Content-Type': 'application/json',
                                            //                 Authorization: process.env.SEVDESK_API_TOKEN.toString(),
                                            //             }
                                            //         });
                                            //     } catch (error) {
                                            //         console.log(error);
                                            //         next(error);
                                            //     }
                                            // } catch (error) {
                                            //     next(error);
                                            // }
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

const createArchiveStad = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findInAdvertisers = await knex(advertiser).where({ id: id }).returning('id');
                if (findInAdvertisers.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    try {
                        const findAddress = await knex(address).where({
                            id: req.body.address_id,
                        })
                            .returning(['latitude', 'longitude']);

                        if (findAddress.length === 0) {
                            next(createError(400, 'Error: STAD could not created.'));
                        } else {
                            try {
                                const subsubcategoryList = req.body.subsubcategorys;
                                delete req.body.subsubcategorys;
                                const newArchiveStad = await knex(stad).insert({
                                    ...req.body,
                                    is_active: false,
                                    is_archive: true,
                                    begin: null,
                                    end: null,
                                    category_id: findAddress[0].category_id,
                                    subcategory_id: findAddress[0].subcategory_id,
                                    invoice_address_id: findAddress[0].invoice_address_id,
                                    latitude: findAddress[0].latitude,
                                    longitude: findAddress[0].longitude,
                                    advertiser_id: id
                                })
                                    .returning('*');


                                if (newArchiveStad.length === 0) {
                                    next(createError(400, 'STAD: Create archive error.'));
                                } else {
                                    let subSubList = subsubcategoryList;

                                    const fieldsToInsert = subSubList.map(subsub_ids =>
                                        ({ stad_id: newArchiveStad[0].id, subsubcategory_id: subsub_ids, is_archive: true }));

                                    try {
                                        const stadsInSubsubcategorysTable = await knex(subSub_Stad).insert(fieldsToInsert).returning('id');

                                        if (stadsInSubsubcategorysTable.length === 0) {
                                            throw new Error('Subsubcategory Error.');
                                        } else {
                                            res.json(newArchiveStad[0]);
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

const archiveToActive = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findInAdvertisers = await knex(advertiser).where({ id: id }).returning('id');
                if (findInAdvertisers.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    const beginArgs = await req.body.begin;
                    const endArgs = await req.body.end;
                    try {
                        const newStadIsBeforeBeginAndEndingAfterBegin = await knex(stad).where({
                            address_id: req.body.address_id,
                            is_deleted: false,
                            completely_deleted: false,
                            is_archive: false,
                            advertiser_id: id,
                        })
                            .whereBetween('begin', [beginArgs, endArgs])
                            .returning('id');

                        try {
                            const newStadIsBetweenAnExistingStad = await knex(stad).where({
                                address_id: req.body.address_id,
                                is_deleted: false,
                                is_archive: false,
                                completely_deleted: false,
                                advertiser_id: id,
                            })
                                .where('begin', '<=', beginArgs)
                                .where('end', '>=', endArgs)
                                .returning('id');

                            try {
                                const newStadIsAfterBeginAndEndingAfterEnd = await knex(stad).where({
                                    address_id: req.body.address_id,
                                    is_deleted: false,
                                    is_archive: false,
                                    completely_deleted: false,
                                    advertiser_id: id,
                                })
                                    .whereBetween('end', [beginArgs, endArgs])
                                    .returning('id');


                                if (newStadIsAfterBeginAndEndingAfterEnd.length === 0 && newStadIsBeforeBeginAndEndingAfterBegin.length === 0 && newStadIsBetweenAnExistingStad.length === 0) {

                                    try {
                                        const findAddress = await knex(address).where({
                                            id: req.body.address_id,
                                        })
                                            .returning('*');

                                        if (findAddress.length === 0) {
                                            next(createError(400, 'Error: STAD could not created.'));
                                        } else {
                                            if (!findAddress[0].is_active) {
                                                next(createError(406, "Address is not activated."));
                                            } else {
                                                let salesTax = await SalesTax.getSalesTax(findAddress[0].country_code);
                                                let rate = await salesTax.rate;
                                                let taxPrice = req.body.price != 0 ? (req.body.price * rate).toFixed(2) : 0;
                                                taxPrice = parseFloat(taxPrice);
                                                let gross = (req.body.price + taxPrice).toFixed(2);
                                                gross = parseFloat(taxPrice);

                                                try {
                                                    const subsubcategoryList = req.body.subsubcategorys;
                                                    delete req.body.subsubcategorys;
                                                    const archiveToActiveStad = await knex(stad).where({
                                                        id: req.body.id,
                                                        is_archive: true,
                                                        advertiser_id: id,
                                                    }).update({
                                                        ...req.body,
                                                        is_archive: false,
                                                        tax_price: taxPrice,
                                                        gross: gross,
                                                        last_update_from_user_id: id
                                                    })
                                                        .returning('*');

                                                    try {
                                                        const activateSubSubStad = await knex(subSub_Stad).where({
                                                            stad_id: req.body.id,
                                                            advertiser_id: id,
                                                        })
                                                            .returning('*');


                                                        if (activateSubSubStad.length === 0) {
                                                            next(createError(400, 'ERROR: STAD not activated.'));
                                                        } else {
                                                            try {
                                                                await knex(subSub_Stad).where({
                                                                    stad_id: req.body.id,
                                                                    advertiser_id: id,
                                                                }).del();
                                                            } catch (error) {
                                                                next(error);
                                                            }
                                                            let subSubList = subsubcategoryList;

                                                            const fieldsToInsert = subSubList.map(subsub_ids =>
                                                                ({ stad_id: archiveToActiveStad[0].id, subsubcategory_id: subsub_ids }));
                                                            try {
                                                                const stadsInSubsubcategorysTable = await knex(subSub_Stad).insert(fieldsToInsert).returning('id');

                                                                if (stadsInSubsubcategorysTable.length === 0) {
                                                                    next(createError(400, 'Subsubcategory Error.'));
                                                                } else {
                                                                    res.json(archiveToActiveStad[0]);
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
                                    } catch (error) {
                                        next(error);
                                    }
                                } else {
                                    next(createError(406, 'You have already a STAD in your choosen Time-Span.'));
                                }
                            } catch (error) {
                                next(error);
                            }
                        } catch (error) {
                            next(error);
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

const findStadsForCustomer = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;
    if (permission === process.env.PERMISSION_KEY_CUSTOMER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findCustomer = await knex(customer).where({ id: id }).returning('*');


                if (findCustomer.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {



                    const findedStads = await knex.raw(`
              SELECT DISTINCT public."STAD".*, 
  ST_DistanceSphere(ST_MakePoint(${await findCustomer[0].longitude},${await findCustomer[0].latitude}), ST_MakePoint(public."STAD".longitude,public."STAD".latitude)) AS distance
  FROM public."STAD"
  INNER JOIN public."STAD_Subsubcategory" on public."STAD".id = public."STAD_Subsubcategory".stad_id
  INNER JOIN public."Favorite_Categorys_Customer" on public."Favorite_Categorys_Customer".customer_id = '${await findCustomer[0].id}'
  WHERE (public."Favorite_Categorys_Customer".subsubcategory_id = public."STAD_Subsubcategory".subsubcategory_id)
  AND (public."STAD".is_active = true) 
  AND (ST_DistanceSphere(ST_MakePoint(${await findCustomer[0].longitude},${await findCustomer[0].latitude}), ST_MakePoint(public."STAD".longitude,public."STAD".latitude)) <= public."STAD".display_radius)
  ORDER BY distance`);


                    await res.json(
                        await findedStads.rows
                    );
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
    getMyActiveStad,
    getMyStads,
    oneStad,
    oneInactiveStad,
    allStads,
    createStad,
    updateStad,
    updateStadInPanel,
    deleteStadCompletely,
    deleteStad,
    createArchiveStad,
    archiveToActive,
    findStadsForCustomer,
};