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
const opening_hour = "Opening_Hour";

const getAllAddresses = async (req, res, next) => {
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
                        const allAddresses = await knex(address).orderBy('created_at', 'desc').returning('*');
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

const myAddress = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {


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

                        const findAddress = await knex(address)
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

const myActiveAddresses = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {

            try {


                const findAdvertiser = await knex(advertiser).where({ id: id }).returning('id');


                if (findAdvertiser.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    try {

                        const findAddresses = await knex(address)
                            .where({
                                advertiser_id: id,
                                is_active: true
                            })
                            .returning('*');

                        if (findAddresses.length !== 0) {
                            res.json(findAddresses);
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

const myAddresses = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {

            try {
                const findAdvertiser = await knex(advertiser).where({ id: id }).returning('id');


                if (findAdvertiser.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    try {

                        const findAddresses = await knex(address)
                            .where({
                                advertiser_id: id,
                            })
                            .returning('*');

                        await res.json(await findAddresses);
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

const addressesWithActiveStadsOrQroffer = async (req, res, next) => {
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

                        const findAddresses = await knex(address)
                            .where(
                                function () {
                                    this.where('active_stad', true).orWhere('active_qroffer', true)
                                }
                            )
                            .andWhere({ is_active: true })
                            .returning('*');

                        res.json(findAddresses);

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

const createAddress = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findAdvertiser = await knex(advertiser).where({ id: id }).returning('*');

                if (findAdvertiser.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    if (req.body.address.latitude != null && id != null && req.body.address.country_code != null) {


                        try {

                            const createAnAddress = await knex(address).insert({
                                ...req.body.address,
                                advertiser_id: id,
                                timezone: await find(req.body.address.latitude, req.body.address.longitude),
                            })
                                .returning('*');





                            if (await createAnAddress.length === 0) {
                                next(createError(400, "Address not Created"));
                            } else {
                                const createdAddress = await createAnAddress[0];

                                const createAnInvoiceAddress = await knex(invoice_address).insert({
                                    ...req.body.invoice_address,
                                    address_id: createdAddress.id,
                                    advertiser_id: id,
                                    timezone: await find(req.body.invoice_address.latitude, req.body.invoice_address.longitude),
                                })
                                    .returning('*');

                                if (await createAnInvoiceAddress.length === 0) {
                                    next(createError(400, "Invoice Address not Created"));
                                } else {

                                    const refreshedAddress = await knex(address)
                                        .where({
                                            id: createdAddress.id,
                                            advertiser_id: id,
                                        })
                                        .update({
                                            invoice_address_id: await createAnInvoiceAddress[0].id,
                                        })
                                        .returning('*');

                                    if (req.body.opening_hours != null) {
                                        if (req.body.opening_hours.length > 0) {

                                            const fieldsToInsert = await req.body.opening_hours.map(openinghr =>
                                                ({ day: openinghr.day, day_from: openinghr.day_from, day_to: openinghr.day_to, time_from: openinghr.time_from, time_to_duration: openinghr.time_to_duration, address_id: createdAddress.id, advertiser_id: id, }));

                                            await knex(opening_hour).insert(fieldsToInsert);


                                        }
                                    }


                                    await res.json(await refreshedAddress[0]);



                                    // try {
                                    //     let requestCountry = await axios.request(
                                    //         {
                                    //             method: "GET",
                                    //             url: process.env.SEVDESK_HTTPS_ENDPOINT + "/StaticCountry",
                                    //             headers: {
                                    //                 'Authorization': process.env.SEVDESK_API_TOKEN,
                                    //             }

                                    //         }
                                    //     );

                                    //     let listPickedCountry = await requestCountry.data["objects"];
                                    //     const countryCode = await createAnAddress[0].country_code.toLowerCase();

                                    //     let pickedCountry = await listPickedCountry.find(o => o.code === countryCode);

                                    //     let data = {
                                    //         "street": await createAnAddress[0].street,
                                    //         "zip": await createAnAddress[0].postcode,
                                    //         "city": await createAnAddress[0].city,
                                    //         "contact": {
                                    //             "id": await findAdvertiser[0].sevdesk_id,
                                    //             "objectName": "Contact",
                                    //         },
                                    //         "country": {
                                    //             "id": parseInt(await pickedCountry.id),
                                    //             "objectName": await pickedCountry.objectName
                                    //         },

                                    //     };

                                    //     await axios.request({
                                    //         method: 'POST',
                                    //         url: process.env.SEVDESK_HTTPS_ENDPOINT + "/ContactAddress",
                                    //         data,
                                    //         headers: {
                                    //             'Content-Type': 'application/json',
                                    //             Authorization: process.env.SEVDESK_API_TOKEN.toString(),
                                    //         }
                                    //     }
                                    //     ).catch(error => {
                                    //         next(error);
                                    //     });

                                    // } catch (error) {
                                    //     next(error);
                                    // }
                                }
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

const createAddressInPanel = async (req, res, next) => {
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
                    if (req.body.latitude != null && id != null && req.body.country_code != null) {


                        try {
                            const createAnAddress = await knex(address).insert({
                                ...req.body,
                                timezone: await find(req.body.latitude, req.body.longitude),
                            })
                                .returning('*');

                            if (await createAnAddress.length === 0) {
                                next(createError(400, "Address not Created"))
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

const updateAddress = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findAdvertiser = await knex(advertiser).where({ id: id }).returning('id');

                if (findAdvertiser.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    if (req.body.address.latitude != null && id != null && req.body.address.country_code != null) {

                        try {
                            const updatedAddress = await knex(address).where({
                                advertiser_id: id,
                                id: req.body.address.id
                            }).update({
                                ...req.body.address,
                                is_active: false,
                                timezone: await find(req.body.address.latitude, req.body.address.longitude),
                                advertiser_id: id,
                                last_update_from_user_id: id,
                            })
                                .returning('*');

                            if (await updatedAddress.length === 0) {
                                next(createError(400, "Address not Updated"))
                            } else {
                                await knex(invoice_address).where({
                                    advertiser_id: id,
                                    id: req.body.invoice_address.id
                                }).update({
                                    ...req.body.invoice_address,
                                    timezone: await find(req.body.invoice_address.latitude, req.body.invoice_address.longitude),
                                    last_update_from_user_id: id,
                                });

                                await knex(opening_hour).where({
                                    advertiser_id: id,
                                    address_id: await req.body.address.id,
                                }).del();

                                if (req.body.opening_hours != null) {
                                    if (req.body.opening_hours.length > 0) {

                                        const fieldsToInsert = await req.body.opening_hours.map(openinghr =>
                                            ({ day: openinghr.day, day_from: openinghr.day_from, day_to: openinghr.day_to, time_from: openinghr.time_from, time_to_duration: openinghr.time_to_duration, address_id: req.body.address.id, advertiser_id: id, }));

                                        await knex(opening_hour).insert(fieldsToInsert);
                                    }
                                }

                                try {
                                    await knex(qroffer).where({
                                        address_id: await updatedAddress[0].id,
                                        advertiser_id: id,
                                        is_deleted: false,

                                    })
                                        .update({
                                            latitude: await updatedAddress[0].latitude,
                                            longitude: await updatedAddress[0].longitude,
                                            last_update_from_user_id: id,
                                        });
                                } catch (error) {
                                    next(error);
                                }
                                try {
                                    await knex(stad).where({
                                        address_id: await updatedAddress[0].id,
                                        advertiser_id: id,
                                        is_deleted: false
                                    })
                                        .update({
                                            latitude: await updatedAddress[0].latitude,
                                            longitude: await updatedAddress[0].longitude,
                                            last_update_from_user_id: id,
                                        });

                                } catch (error) {
                                    next(error);
                                }

                                await res.json(await updatedAddress[0]);
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

const updateQrofferShortDescription = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findAdvertiser = await knex(advertiser).where({ id: id }).returning('id');

                if (findAdvertiser.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {


                    try {
                        const updatedShortDescription = await knex(address).where({
                            id: req.body.id,
                            advertiser_id: id
                        })
                            .update({
                                qroffer_short_description: req.body.qroffer_short_description,
                                last_update_from_user_id: id
                            }).returning('*');

                        if (await updatedShortDescription.length === 0) {
                            next(createError(400, "Update qroffer short description error!"));
                        } else {
                            res.json(updatedShortDescription[0]);
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

const updateQrofferShortDescriptionInPanel = async (req, res, next) => {
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
                        const updatedShortDescription = await knex(address).where({
                            id: req.body.id,
                        })
                            .update({
                                qroffer_short_description: req.body.qroffer_short_description,
                                last_update_from_user_id: id
                            }).returning('*');

                        if (await updatedShortDescription.length === 0) {
                            next(createError(400, "Update qroffer short description error!"));
                        } else {
                            res.json(updatedShortDescription[0]);
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

const deleteAddressFromDb = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findInAdvertisers = await knex(advertiser).where({ id: id }).returning('id');


                if (await findInAdvertisers.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    try {
                        const findAddress = await knex(address)
                            .where({
                                id: req.params.identifier,
                                advertiser_id: id,
                            })
                            .returning('*');


                        if (await findAddress.length === 0) {
                            next(createError(400, 'Store could not deleted!'));
                        } else {
                            try {

                                res.json(findAddress[0]);
                                await knex(address).where({
                                    id: req.params.identifier,
                                    advertiser_id: id,
                                }).del();

                            } catch (error) {
                                next(error);
                            }





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

const deleteAddress = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {
            try {
                const findInAdvertisers = await knex(advertiser).where({ id: id }).returning('id');


                if (await findInAdvertisers.length === 0) {
                    next(createError(401, 'Permission denied!'));
                } else {
                    try {
                        const deletedAddress = await knex(address)
                            .where({
                                id: req.body.id,
                                advertiser_id: id,
                                is_deleted: false
                            })
                            .update({
                                is_deleted: true,
                                active_qroffer: false,
                                active_stad: false,
                                last_update_from_user_id: id,
                            })
                            .returning('*');


                        if (await deletedAddress.length === 0) {
                            throw new Error('Address could not deleted!. Error!');
                        } else {
                            try {
                                await knex(qroffer).where({
                                    address_id: deletedAddress[0].id,
                                    advertiser_id: id,
                                    is_deleted: false
                                })
                                    .update({
                                        is_deleted: true,
                                        expiry_date: DateTime.now().toISO().toString(),
                                    });
                            } catch (error) {
                                next(error);
                            }
                            try {
                                await knex(stad).where({
                                    address_id: deletedAddress[0].id,
                                    advertiser_id: id,
                                    is_deleted: false
                                })
                                    .update({
                                        is_deleted: true,
                                    });
                            } catch (error) {
                                next(error);
                            }

                            try {
                                await knex(wallet)
                                    .where('qroffer_id.address_id', deletedAddress[0])
                                    .update({
                                        expiry_date: DateTime.now().toISO().toString(),
                                        is_expired: true,
                                        is_deleted_customer: true,
                                        is_deleted_advertiser: true,
                                        is_deleted: true,
                                    });
                            } catch (error) {
                                next(error);
                            }

                            try {
                                await knex(invoice_address).where({
                                    address_id: deletedAddress[0].id,
                                    advertiser_id: id,
                                    is_deleted: false
                                })
                                    .update({
                                        is_deleted: true,
                                    });
                            } catch (error) {
                                next(error);
                            }

                            await res.json(await deletedAddress[0]);
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

const updateAddressInPanel = async (req, res, next) => {
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
                    if (req.body.longitude != null && req.body.latitude != null) {
                        try {
                            const updatedAddress = await knex(address).where({ id: req.body.id })
                                .update({
                                    ...req.body,
                                    timezone: await find(req.body.latitude, req.body.longitude),
                                    last_update_from_user_id: id
                                }).returning('*');

                            if (await updatedAddress.length === 0) {
                                next(createError(400, 'Update not executed!'));
                            } else {
                                res.json(updatedAddress[0]);
                            }
                        } catch (error) {
                            next(error);
                        }

                    } else {
                        try {
                            const updatedAddress = await knex(address)
                                .where({
                                    id: req.body.id
                                })
                                .update({
                                    ...req.body,
                                    last_update_from_user_id: id
                                }).returning('*');

                            if (await updatedAddress.length === 0) {
                                next(createError(400, "Update storeaddress error!"));
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

const findAddressesForCustomer = async (req, res, next) => {
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

                    const updatedCustomer = await knex(customer).where({ id: id })
                        .update({
                            latitude: req.body.latitude,
                            longitude: req.body.longitude,
                        })
                        .returning('*');

                    if (updatedCustomer.length === 0) {
                        next(createError(400, 'Fetch STADS and QROFFERS failed!'));
                    } else {

                        const findAddressesWithActiveStads = await knex.raw(`SELECT DISTINCT public."Address".id,
  ST_DistanceSphere(ST_MakePoint(${await findCustomer[0].longitude},${await findCustomer[0].latitude}), ST_MakePoint(public."STAD".longitude,public."STAD".latitude)) AS distance
  FROM public."STAD"
  INNER JOIN public."STAD_Subsubcategory" on public."STAD".id = public."STAD_Subsubcategory".stad_id
  INNER JOIN public."Favorite_Categorys_Customer" on public."Favorite_Categorys_Customer".customer_id = '${await updatedCustomer[0].id}'
  INNER JOIN public."Address" on public."Address".id = public."STAD".address_id
  WHERE (public."Favorite_Categorys_Customer".subsubcategory_id = public."STAD_Subsubcategory".subsubcategory_id)
  AND (public."STAD".is_active = true) 
  AND (ST_DistanceSphere(ST_MakePoint(${await updatedCustomer[0].longitude},${await updatedCustomer[0].latitude}), ST_MakePoint(public."STAD".longitude,public."STAD".latitude)) <= public."STAD".display_radius)
  ORDER BY distance`);

                        const findAddressesWithActiveQroffers = await knex.raw(`SELECT DISTINCT public."Address".id,
              ST_DistanceSphere(ST_MakePoint(${await findCustomer[0].longitude},${await findCustomer[0].latitude}), ST_MakePoint(public."QROFFER".longitude,public."QROFFER".latitude)) AS distance
              FROM public."QROFFER"
              INNER JOIN public."QROFFER_Subsubcategory" on public."QROFFER".id = public."QROFFER_Subsubcategory".qroffer_id
              INNER JOIN public."Favorite_Categorys_Customer" on public."Favorite_Categorys_Customer".customer_id = '${await updatedCustomer[0].id}'
              INNER JOIN public."Address" on public."Address".id = public."QROFFER".address_id
              WHERE (public."Favorite_Categorys_Customer".subsubcategory_id = public."QROFFER_Subsubcategory".subsubcategory_id)
              AND (public."QROFFER".is_active = true) 
              AND (ST_DistanceSphere(ST_MakePoint(${await updatedCustomer[0].longitude},${await updatedCustomer[0].latitude}), ST_MakePoint(public."QROFFER".longitude,public."QROFFER".latitude)) <= public."QROFFER".display_radius)
              ORDER BY distance`);


                        const addressList = await findAddressesWithActiveQroffers.rows.concat(await findAddressesWithActiveStads.rows);


                        let list = [];

                        await addressList.map(adrs => list.push(adrs.id));

                        const addressUniqueList = [...new Set(list)];

                        const mappedUniqueList = await addressUniqueList.map(adrs =>
                            ({ id: adrs }));

                        await res.json(
                            await mappedUniqueList,
                        )
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

const activeAddresses = async (req, res, next) => {
    const id = await getUserId(req);
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (id == null) {
            next(createError(401, 'Permission denied!'));
        } else {

            try {
                const findCustomer = await knex(customer).where({ id: id }).returning('id');

                const findInWorkers = await knex(worker).where({ id: id }).returning('id');


                if (findInWorkers.length === 0 && findAdvertiser.length === 0 && findCustomer.length === 0) {
                    next(createError(401, 'Permission denied!'));
                }
                if (findInWorkers.length !== 0 || findAdvertiser.length !== 0 || findCustomer.length !== 0) {
                    try {
                        const allAddresses = await knex(address).where({
                            is_active: true,
                        }).returning('*');
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

module.exports = {
    getAllAddresses,
    myAddress,
    myActiveAddresses,
    addressesWithActiveStadsOrQroffer,
    createAddress,
    createAddressInPanel,
    updateAddress,
    updateQrofferShortDescription,
    updateQrofferShortDescriptionInPanel,
    deleteAddress,
    deleteAddressFromDb,
    updateAddressInPanel,
    myAddresses,
    findAddressesForCustomer,
    activeAddresses,
}