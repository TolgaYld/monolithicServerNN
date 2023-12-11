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
const subSub_Qroffer = "QROFFER_Subsubcategory";

const getAllMyActiveQroffer = async (req, res, next) => {
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
                        const allQroffer = await knex(qroffer)
                            .where({
                                is_active: true,
                                is_banned: false,
                                is_deleted: false,
                                advertiser_id: id
                            }).returning('*');
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

const getAllMyQroffer = async (req, res, next) => {
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
                        const allQroffer = await knex(qroffer)
                            .where({
                                is_banned: false,
                                completely_deleted: false,
                                advertiser_id: id
                            }).returning('*');
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

const oneQroffer = async (req, res, next) => {
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

                        const findQroffer = await knex(qroffer)
                            .where({
                                id: req.params.identifier,
                            })
                            .orderBy('created_at', 'desc')
                            .returning('*');

                        if (findQroffer.length !== 0) {
                            res.json(findQroffer[0]);
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

const oneInactiveQroffer = async (req, res, next) => {
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

                        const findQroffer = await knex(qroffer)
                            .where({
                                id: req.params.identifier,
                                is_banned: false,
                                is_deleted: false,
                                completely_deleted: false
                            })
                            .orderBy('created_at', 'desc')
                            .returning('*');

                        if (findQroffer.length !== 0) {
                            res.json(findQroffer[0]);
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

const allQroffers = async (req, res, next) => {
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

                        const findAllQroffer = await knex(qroffer)
                            .orderBy('created_at', 'desc')
                            .returning('*');

                        if (findAddresses.length !== 0) {
                            res.json(findAllQroffer);
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

const createQroffer = async (req, res, next) => {
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
                    const shortDescriptionAddress = req.body.qroffer_short_description;
                    delete req.body.qroffer_short_description;
                    const beginArgs = await req.body.begin;
                    const endArgs = await req.body.end;
                    try {
                        const newQrofferIsBeforeBeginAndEndingAfterBegin = await knex(qroffer).where({
                            address_id: req.body.address_id,
                            is_deleted: false,
                            is_archive: false,
                            completely_deleted: false,
                            advertiser_id: id,
                        })
                            .whereBetween('begin', [beginArgs, endArgs])
                            .returning('id');

                        try {
                            const newQrofferIsBetweenAnExistingQroffer = await knex(qroffer).where({
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
                                const newQrofferIsAfterBeginAndEndingAfterEnd = await knex(qroffer).where({
                                    address_id: req.body.address_id,
                                    is_deleted: false,
                                    is_archive: false,
                                    completely_deleted: false,
                                    advertiser_id: id,
                                })
                                    .whereBetween('end', [beginArgs, endArgs])
                                    .returning('id');

                                const concatThreeArays = newQrofferIsAfterBeginAndEndingAfterEnd.concat(newQrofferIsBeforeBeginAndEndingAfterBegin, newQrofferIsBetweenAnExistingQroffer);

                                const unique = [...new Set(concatThreeArays)];


                                if (unique < 9) {

                                    try {
                                        const findAddress = await knex(address).where({
                                            id: req.body.address_id,
                                        })
                                            .returning('*');

                                        if (findAddress.length === 0) {
                                            next(createError(400, 'Error: QROFFER could not created.'));
                                        } else {
                                            if (!findAddress[0].is_active) {
                                                next(createError(406, "Address is not activated."));
                                            } else {
                                                let salesTax = await SalesTax.getSalesTax(findAddress[0].country_code);
                                                let rate = await salesTax.rate
                                                let taxPrice = (req.body.price * rate).toFixed(2);
                                                taxPrice = parseFloat(taxPrice);
                                                let gross = (req.body.price + taxPrice).toFixed(2);
                                                gross = parseFloat(taxPrice);
                                                try {
                                                    const subsubcategoryList = req.body.subsubcategorys;
                                                    delete req.body.subsubcategorys;
                                                    const newQroffer = await knex(qroffer).insert({
                                                        ...req.body,
                                                        latitude: findAddress[0].latitude,
                                                        longitude: findAddress[0].longitude,
                                                        category_id: findAddress[0].category_id,
                                                        subcategory_id: findAddress[0].subcategory_id,
                                                        invoice_address_id: findAddress[0].invoice_address_id,
                                                        advertiser_id: id,
                                                        tax_price: taxPrice,
                                                        gross: gross,
                                                    }).returning('*');


                                                    if (newQroffer.length === 0) {
                                                        next(createError(400, 'Error: QROFFER could not created.'));
                                                    } else {

                                                        let subSubList = subsubcategoryList;

                                                        const fieldsToInsert = subSubList.map(subsub_ids =>
                                                            ({ qroffer_id: newQroffer[0].id, subsubcategory_id: subsub_ids }));
                                                        try {
                                                            const qroffersInSubsubcategorysTable = await knex(subSub_Qroffer).insert(fieldsToInsert).returning('id');

                                                            if (qroffersInSubsubcategorysTable.length === 0) {
                                                                next(createError(400, 'Error: SubSubCategoryInsert Error'));
                                                            } else {
                                                                if (findAddress[0].qroffer_short_description == null) {
                                                                    await knex(address).where({
                                                                        id: req.body.address_id,
                                                                    }).update({
                                                                        qroffer_short_description: newQroffer[0].short_description,
                                                                    });
                                                                } else {
                                                                    await knex(address).where({
                                                                        id: req.body.address_id,
                                                                    }).update({
                                                                        qroffer_short_description: shortDescriptionAddress,
                                                                    });
                                                                }
                                                                res.json(newQroffer[0]);
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
                                    next(createError(406, 'You have already 9 QROFFER in your choosen Time-Span.'));
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

const updateQroffer = async (req, res, next) => {
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
                    const findQroffer = await knex(qroffer).where({
                        id: req.body.id,
                        advertiser_id: id,
                        is_banned: false,
                        is_deleted: false,
                    }).returning('created_at');

                    if (findQroffer.length === 0) {
                        next(createError(404, "Can not find Qroffer"));
                    } else {
                        const beginTime = DateTime.fromJSDate(findQroffer[0].begin);
                        if (DateTime.now().toUTC().diff(beginTime, 'minutes').minutes < 6 || findQroffer[0].is_archive) {
                            const beginArgs = await req.body.begin;
                            const endArgs = await req.body.end;
                            try {
                                const newQrofferIsBeforeBeginAndEndingAfterBegin = await knex(qroffer).where({
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
                                    const newQrofferIsBetweenAnExistingQroffer = await knex(qroffer).where({
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
                                        const newQrofferIsAfterBeginAndEndingAfterEnd = await knex(qroffer).where({
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

                                        const concatThreeArays = newQrofferIsAfterBeginAndEndingAfterEnd.concat(newQrofferIsBeforeBeginAndEndingAfterBegin, newQrofferIsBetweenAnExistingQroffer);

                                        const unique = [...new Set(concatThreeArays)];


                                        if (unique < 9) {

                                            try {
                                                const findAddress = await knex(address).where({ id: req.body.address_id }).returning('*');

                                                if (findAddress.length === 0) {
                                                    next(createError(404, "Can not find Storeaddress"));
                                                } else {
                                                    const shortDescriptionAddress = req.body.qroffer_short_description;
                                                    delete req.body.qroffer_short_description;
                                                    let salesTax = await SalesTax.getSalesTax(findAddress[0].country_code);
                                                    let rate = await salesTax.rate;
                                                    let taxPrice = (req.body.price * rate).toFixed(2);
                                                    taxPrice = parseFloat(taxPrice);
                                                    let gross = (req.body.price + taxPrice).toFixed(2);
                                                    gross = parseFloat(taxPrice);
                                                    try {
                                                        const subsubcategoryList = req.body.subsubcategorys;
                                                        delete req.body.subsubcategorys;
                                                        const updatedQroffer = await knex(qroffer).where({
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

                                                        if (updatedQroffer.length === 0) {

                                                            next(createError(400, "Update QROFFER error."));
                                                        } else {

                                                            try {
                                                                await knex(subSub_Qroffer).where({ qroffer_id: req.body.id }).del();
                                                            } catch (error) {
                                                                next(error);
                                                            }
                                                            let subSubList = subsubcategoryList;

                                                            const fieldsToInsert = subSubList.map(subsub_ids =>
                                                                ({ qroffer_id: updatedQroffer[0].id, subsubcategory_id: subsub_ids }));

                                                            try {
                                                                const qroffersInSubsubcategorysTable = await knex(subSub_Qroffer).insert(fieldsToInsert).returning('id');

                                                                if (qroffersInSubsubcategorysTable.length === 0) {
                                                                    next(createError(400, 'Error: SubSubCategoryInsert Error'));
                                                                } else {
                                                                    await knex(address).where({
                                                                        id: req.body.address_id,
                                                                    }).update({
                                                                        qroffer_short_description: shortDescriptionAddress,
                                                                    });
                                                                    await res.json(await updatedQroffer[0]);
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
                                            next(createError(406, 'You have already 9 QROFFER in your choosen Time-Span.'));
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
                            next(createError(406, 'Time to update is expired.'));
                        }
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

const updateQrofferInPanel = async (req, res, next) => {
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
                        const newQrofferIsBeforeBeginAndEndingAfterBegin = await knex(qroffer).where({
                            address_id: req.body.address_id,
                            is_deleted: false,
                            is_archive: false,
                            completely_deleted: false,
                            advertiser_id: req.body.advertiser_id,
                        })
                            .whereNot({
                                id: req.body.id
                            })
                            .whereBetween('begin', [beginArgs, endArgs])
                            .returning('id');

                        try {
                            const newQrofferIsBetweenAnExistingQroffer = await knex(qroffer).where({
                                address_id: req.body.address_id,
                                is_deleted: false,
                                is_archive: false,
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
                                const newQrofferIsAfterBeginAndEndingAfterEnd = await knex(qroffer).where({
                                    address_id: req.body.address_id,
                                    is_deleted: false,
                                    is_archive: false,
                                    completely_deleted: false,
                                    advertiser_id: req.body.advertiser_id,
                                })
                                    .whereNot({
                                        id: req.body.id
                                    })
                                    .whereBetween('end', [beginArgs, endArgs])
                                    .returning('id');


                                if ((newQrofferIsAfterBeginAndEndingAfterEnd.length + newQrofferIsBeforeBeginAndEndingAfterBegin.length + newQrofferIsBetweenAnExistingQroffer.length) < 9) {

                                    try {
                                        const findAddress = await knex(address).where({ id: req.body.address_id }).returning('*');

                                        if (findAddress.length === 0) {
                                            next(createError(404, "Can not find Storeaddress"));
                                        } else {
                                            let salesTax = await SalesTax.getSalesTax(findAddress[0].country_code);
                                            let rate = await salesTax.rate;
                                            let taxPrice = (req.body.price * rate).toFixed(2);
                                            taxPrice = parseFloat(taxPrice);
                                            let gross = (req.body.price + taxPrice).toFixed(2);
                                            gross = parseFloat(taxPrice);
                                            try {
                                                const subsubcategoryList = req.body.subsubcategorys;
                                                delete req.body.subsubcategorys;
                                                const updatedQroffer = await knex(qroffer).where({ id: req.body.id })
                                                    .update({
                                                        ...req.body,
                                                        tax_price: taxPrice,
                                                        gross: gross,
                                                        last_update_from_user_id: id
                                                    }).returning('*');

                                                if (updatedQroffer.length === 0) {
                                                    next(createError(400, "Update QROFFER error."));
                                                } else {

                                                    try {
                                                        await knex(subSub_Qroffer).where({ qroffer_id: req.body.qroffer_id }).del();
                                                    } catch (error) {
                                                        console.log(error);
                                                    }
                                                    let subSubList = subsubcategoryList;

                                                    const fieldsToInsert = subSubList.map(subsub_ids =>
                                                        ({ qroffer_id: updatedQroffer[0].id, subsubcategory_id: subsub_ids }));

                                                    try {
                                                        const qroffersInSubsubcategorysTable = await knex(subSub_Qroffer).insert(fieldsToInsert).returning('id');

                                                        if (qroffersInSubsubcategorysTable.length === 0) {
                                                            next(createError(400, 'Error: SubSubCategoryInsert Error'));
                                                        } else {
                                                            res.json(updatedQroffer[0]);
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
                                    next(createError(406, 'Advertiser has already 9 QROFFER in your choosen Time-Span.'));
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

const deleteQrofferCompletely = async (req, res, next) => {
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
                        const deletedQroffer = await knex(qroffer)
                            .where({
                                id: req.body,
                                advertiser_id: id,
                                is_deleted: true
                            })
                            .update({
                                completely_deleted: true,
                            })
                            .returning('*')

                        if (deletedQroffer.length === 0) {
                            next(createError(400, "Delete QROFFER error."));
                        } else {
                            res.json(deletedQroffer[0]);
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

const deleteQroffer = async (req, res, next) => {
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
                        const findQroffer = await knex(qroffer).where({
                            id: req.body.id,
                            advertiser_id: id,
                            is_banned: false,
                            is_deleted: false
                        }).returning('*');

                        if (findQroffer.length === 0) {
                            next(createError(400, 'Error: QROFFER could not deleted.'));
                        } else {
                            try {
                                const findAddress = await knex(address).where({
                                    id: findQroffer[0].address_id,
                                    advertiser_id: id,
                                }).returning('*');
                                if (findAddress.length === 0) {
                                    next(createError(400, 'Error: QROFFER could not deleted.'));
                                } else {

                                    try {
                                        let salesTax = await SalesTax.getSalesTax(findAddress[0].country_code);
                                        let rate = await salesTax.rate;
                                        let taxPrice = req.body.price != 0 ? (req.body.price * rate).toFixed(2) : 0;
                                        taxPrice = parseFloat(taxPrice);
                                        let gross = (req.body.price + taxPrice).toFixed(2);
                                        gross = parseFloat(taxPrice);
                                        const now = DateTime.now().toUTC();

                                        const beginTime = DateTime.fromJSDate(findQroffer[0].begin);


                                        const deletedQroffer = await knex(qroffer).where({
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
                                            is_expired: true,
                                            expiry_date: DateTime.now().minus({ days: 1 }).toUTC().toISO().toString(),
                                            last_update_from_user_id: id,
                                        }).returning('*');


                                        if (deletedQroffer.length === 0) {
                                            next(createError(400, 'Error: QROFFER could not deleted.'));
                                        } else {
                                            try {
                                                const findQroffer = await knex(qroffer).where({ is_deleted: false, advertiser_id: id, address_id: deletedQroffer[0].address_id }).returning('id');


                                                if (findQroffer.length === 0) {
                                                    try {
                                                        await knex(address).where({ id: deletedQroffer[0].address_id }).update({
                                                            active_qroffer: false,
                                                            last_update_from_user_id: id
                                                        });
                                                    } catch (error) {
                                                        next(error);
                                                    }
                                                }
                                                try {
                                                    await knex(subSub_Qroffer).where({ qroffer_id: deletedQroffer[0].id }).update({
                                                        is_deleted: true,
                                                        last_update_from_user_id: id
                                                    });
                                                } catch (error) {
                                                    next(error);
                                                }
                                                try {
                                                    await knex(wallet).where({ qroffer_id: deletedQroffer[0].id }).update({
                                                        is_deleted_customer: true,
                                                        is_deleted_advertiser: true,
                                                        expiry_date: DateTime.now().toUTC().toISO().toString(),
                                                        is_expired: true,
                                                        is_deleted: true,
                                                        last_update_from_user_id: id
                                                    });
                                                } catch (error) {
                                                    next(error);
                                                }

                                                try {
                                                    const findNotDeletedQroffer = await knex(qroffer).where({
                                                        advertiser_id: id,
                                                        is_deleted: false,
                                                        address_id: deletedQroffer[0].address_id
                                                    }).returning('id');

                                                    if (findNotDeletedQroffer.length === 0) {
                                                        try {
                                                            await knex(address).where({ id: deletedQroffer[0].address_id })
                                                                .update({
                                                                    qroffer_short_description: null
                                                                });
                                                        } catch (error) {
                                                            next(error);
                                                        }
                                                    } else {
                                                        try {
                                                            await knex(address).where({ id: deletedQroffer[0].address_id })
                                                                .update({
                                                                    qroffer_short_description: deletedQroffer[0].short_description
                                                                });
                                                        } catch (error) {
                                                            next(error);
                                                        }
                                                    }

                                                    res.json(deletedQroffer[0]);

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

const createArchiveQroffer = async (req, res, next) => {
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
                    const findAddress = await knex(address).where({
                        id: req.body.address_id,
                    })
                        .returning(['latitude', 'longitude']);

                    if (findAddress.length === 0) {
                        next(createError(400, 'Error: QROFFER could not created.'));
                    } else {
                        try {
                            const subsubcategoryList = req.body.subsubcategorys;
                            delete req.body.subsubcategorys;
                            const newArchiveQroffer = await knex(qroffer).insert({
                                ...req.body,
                                is_active: false,
                                is_archive: true,
                                expiry_date: null,
                                begin: null,
                                end: null,
                                latitude: findAddress[0].latitude,
                                longitude: findAddress[0].longitude,
                                category_id: findAddress[0].category_id,
                                subcategory_id: findAddress[0].subcategory_id,
                                invoice_address_id: findAddress[0].invoice_address_id,
                                advertiser_id: id
                            })
                                .returning('*');


                            if (newArchiveQroffer.length === 0) {
                                next(createError(400, 'QROFFER: Create archive error.'));
                            } else {
                                let subSubList = subsubcategoryList;

                                const fieldsToInsert = subSubList.map(subsub_ids =>
                                    ({ qroffer_id: newArchiveQroffer[0].id, subsubcategory_id: subsub_ids, is_archive: true }));

                                try {
                                    const qroffersInSubsubcategorysTable = await knex(subSub_Qroffer).insert(fieldsToInsert).returning('id');

                                    if (qroffersInSubsubcategorysTable.length === 0) {
                                        next(createError(400, 'Error: SubSubCategoryInsert Error'));
                                    } else {
                                        res.json(newArchiveQroffer[0]);
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
                        const newQrofferIsBeforeBeginAndEndingAfterBegin = await knex(qroffer).where({
                            address_id: req.body.address_id,
                            is_deleted: false,
                            completely_deleted: false,
                            is_archive: false,
                            advertiser_id: id,
                        })
                            .whereBetween('begin', [beginArgs, endArgs])
                            .returning('id');

                        try {
                            const newQrofferIsBetweenAnExistingQroffer = await knex(qroffer).where({
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
                                const newQrofferIsAfterBeginAndEndingAfterEnd = await knex(qroffer).where({
                                    address_id: req.body.address_id,
                                    is_deleted: false,
                                    is_archive: false,
                                    completely_deleted: false,
                                    advertiser_id: id,
                                })
                                    .whereBetween('end', [beginArgs, endArgs])
                                    .returning('id');


                                if ((newQrofferIsAfterBeginAndEndingAfterEnd.length + newQrofferIsBeforeBeginAndEndingAfterBegin.length + newQrofferIsBetweenAnExistingQroffer.length) < 9) {

                                    try {
                                        const findAddress = await knex(address).where({
                                            id: req.body.address_id,
                                        })
                                            .returning(['latitude', 'longitude']);

                                        if (findAddress.length === 0) {
                                            next(createError(400, 'Error: QROFFER could not created.'));
                                        } else {
                                            if (!findAddress[0].is_active) {
                                                next(createError(406, "Address is not activated."));
                                            } else {
                                                let salesTax = await SalesTax.getSalesTax(findAddress[0].country_code);
                                                let rate = await salesTax.rate;
                                                let taxPrice = (req.body.price * rate).toFixed(2);
                                                taxPrice = parseFloat(taxPrice);
                                                let gross = (req.body.price + taxPrice).toFixed(2);
                                                gross = parseFloat(taxPrice);
                                                try {
                                                    const subsubcategoryList = req.body.subsubcategorys;
                                                    delete req.body.subsubcategorys;
                                                    const archiveToActiveQroffer = await knex(qroffer).where({
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
                                                        const activateSubSubQroffer = await knex(subSub_Qroffer).where({
                                                            qroffer_id: req.body.id,
                                                            advertiser_id: id,
                                                        })
                                                            .returning('*');


                                                        if (activateSubSubQroffer.length === 0) {
                                                            next(createError(400, 'ERROR: QROFFER not activated.'));
                                                        } else {
                                                            try {
                                                                await knex(subSub_Qroffer).where({
                                                                    qroffer_id: req.body.id,
                                                                    advertiser_id: id,
                                                                }).del();
                                                            } catch (error) {
                                                                next(error);
                                                            }
                                                            let subSubList = subsubcategoryList;

                                                            const fieldsToInsert = subSubList.map(subsub_ids =>
                                                                ({ qroffer_id: archiveToActiveQroffer[0].id, subsubcategory_id: subsub_ids }));

                                                            try {
                                                                const qroffersInSubsubcategorysTable = await knex(subSub_Qroffer).insert(fieldsToInsert).returning('id');

                                                                if (qroffersInSubsubcategorysTable.length === 0) {
                                                                    next(createError(400, 'Create Subsubcategory Error.'));
                                                                } else {


                                                                    res.json(archiveToActiveQroffer[0]);
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
                                    next(createError(406, 'You have already a QROFFER in your choosen Time-Span.'));
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

const findQroffersForCustomer = async (req, res, next) => {
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

                    const findedQroffers = await knex.raw(`
            SELECT DISTINCT public."QROFFER".*, 
            ST_DistanceSphere(ST_MakePoint(${await findCustomer[0].longitude},${await findCustomer[0].latitude}), ST_MakePoint(public."QROFFER".longitude,public."QROFFER".latitude)) AS distance
            FROM public."QROFFER"
            INNER JOIN public."QROFFER_Subsubcategory" on public."QROFFER".id = public."QROFFER_Subsubcategory".qroffer_id
            INNER JOIN public."Favorite_Categorys_Customer" on public."Favorite_Categorys_Customer".customer_id = '${await findCustomer[0].id}'
            WHERE (public."Favorite_Categorys_Customer".subsubcategory_id = public."QROFFER_Subsubcategory".subsubcategory_id)
            AND (public."QROFFER".is_active = true) 
            AND (ST_DistanceSphere(ST_MakePoint(${await findCustomer[0].longitude},${await findCustomer[0].latitude}), ST_MakePoint(public."QROFFER".longitude,public."QROFFER".latitude)) <= public."QROFFER".display_radius)
            ORDER BY distance`);


                    await res.json(
                        await findedQroffers.rows
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
    getAllMyActiveQroffer,
    oneQroffer,
    oneInactiveQroffer,
    allQroffers,
    createQroffer,
    updateQroffer,
    updateQrofferInPanel,
    deleteQrofferCompletely,
    deleteQroffer,
    createArchiveQroffer,
    archiveToActive,
    getAllMyQroffer,
    findQroffersForCustomer,
}