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

const start = async function asyncIntervallDestroyAccounts() {
    let flag = false;


    setInterval(async () => {
        if (!flag) {
            flag = true;
            let threeMonthsAgo = DateTime.now().minus({ months: 3 }).toUTC().toISO().toString();
            /////////////////////////////////ADVERTISER & CUSTOMER DELETED CONTROL

            try {
                await knex(advertiser).where({
                    is_deleted: true
                })
                    .where('updated_at', '<=', threeMonthsAgo)
                    .del();
            } catch (error) {
                console.log(error);
            }
            try {
                await knex(customer).where({
                    is_deleted: true
                })
                    .where('updated_at', '<=', threeMonthsAgo)
                    .del();
            } catch (error) {
                console.log(error);
            }

            flag = false;
        }
    }, 333);

}

module.exports = {
    start
};