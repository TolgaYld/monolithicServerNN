const knex = require('../db/db');
const { DateTime } = require('luxon');
const geoTz = require('geo-tz');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const SalesTax = require("sales-tax");
const { Storage } = require("@google-cloud/storage");
const stream = require('stream');
const nodemailer = require("nodemailer");
var jwt = require('jsonwebtoken');


//SCHEMAS
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


const start = async function asyncInvervall() {
    let flag = false;

    setInterval(async () => {
        if (!flag) {
            flag = true;
            let yesterdayFrom = DateTime.now().minus({ days: 1, seconds: 1 }).toUTC().toISO().toString();
            let yesterdayTo = DateTime.now().minus({ days: 1, seconds: 1 }).plus({ hours: 3 }).toUTC().toISO().toString();

            try {
                const findAllQroffer = await knex(qroffer).where({
                    is_expired: false
                })
                    .whereBetween('expiry_date', [yesterdayFrom, yesterdayTo])
                    .returning('*');



                for (let i = 0; i < findAllQroffer.length; i++) {
                    try {
                        const findAndUpdateInWallet = await knex(wallet).where({
                            qroffer_id: findAllQroffer[i].id,
                            notified: false,
                            notify: true,
                            is_deleted_customer: false,
                            is_deleted_advertiser: false,
                            is_deleted: false
                        }).update({
                            notified: true
                        }).returning('*');

                        if (findAndUpdateInWallet.length !== 0) {
                            //FCM

                            //Then

                        }
                    } catch (error) {
                        console.log(error);
                    }
                }

                let now = DateTime.now().toUTC().toISO().toString();
                try {
                    const findExpiredQroffer = await knex(qroffer)
                        .where({
                            is_expired: false
                        })
                        .where('expiry_date', '<=', now)
                        .update({
                            is_expired: true
                        }).returning('*');


                    if (findExpiredQroffer.length !== 0) {
                        for (let i = 0; i < findExpiredQroffer.length; i++) {
                            try {
                                await knex(wallet).where({
                                    qroffer_id: findExpiredQroffer[i].id
                                }).update({
                                    is_expired: true,
                                    is_deleted_advertiser: true,
                                    is_deleted_customer: true,
                                    is_deleted: true,
                                });
                            } catch (error) {
                                console.log(error);
                            }
                        }
                    }


                    flag = false;

                } catch (error) {
                    console.log(error);
                }
            } catch (error) {
                console.log(error);
            }
        }
    }, 333);
}

module.exports = {
    start
}