const knex = require('../db/db');
const schedule = require('node-schedule');
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
const confirmEmailTemplateAdvertiser = require('../template/confirmEmailAdvertiserTemplate');
const confirmEmailTemplateCustomer = require('../template/confirmEmailCustomerTemplate');

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

//Send E-Mail Activation

const start = schedule.scheduleJob("0 12 * * 0", async () => {
  try {
    const findAdvertiser = await knex(advertiser)
      .where({
        email_confirmed: false,
        is_active: true,
        is_banned: false,
        is_deleted: false,
      }).returning('*');

    try {
      const findCustomer = await knex(customer)
        .where({
          email_confirmed: false,
          is_active: true,
          is_banned: false,
          is_deleted: false,
        }).returning('*');


      if (findAdvertiser.length !== 0) {
        for (let i = 0; i < findAdvertiser.length; i++) {
          const jwtInfos = {
            id: findAdvertiser[i].id,
            email: findAdvertiser[i].email
          };

          const jwtToken = jwt.sign(jwtInfos, process.env.CONFIRM_MAIL_SECRET, { expiresIn: "365d" });


          const url = process.env.WEB_SITE_URL + 'verify?id=' + jwtToken;


          let transporter = nodemailer.createTransport({
            host: process.env.MAIL_SERVICE,
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PW
            }
          });
          await transporter.sendMail({
            from: 'NowNow <no_reply@nownow.de>',
            to: findAdvertiser[i].email,
            subject: "Bestätige deine E-Mail Adresse",
            html: confirmEmailTemplateAdvertiser(url),
          }, async (error, info) => {
            if (error) {
              console.log("**********************olmadi email: " + error.toString());
            } else {


              console.log("************gönderildi");
              await info
              if (i == findAdvertiser.length - 1) {
                await transporter.close();
              }
            }
          });
        }
      }

      if (findCustomer.length !== 0) {
        for (let j = 0; j < findCustomer.length; j++) {
          const jwtInfos = {
            id: findCustomer[j].id,
            email: findCustomer[j].email
          };

          const jwtToken = jwt.sign(jwtInfos, process.env.CONFIRM_MAIL_SECRET, { expiresIn: "365d" });


          const url = process.env.WEB_SITE_URL + 'verify?id=' + jwtToken;


          let transporter = nodemailer.createTransport({
            host: process.env.MAIL_SERVICE,
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PW
            }
          });
          await transporter.sendMail({
            from: 'NowNow <no_reply@nownow.de>',
            to: findCustomer[j].email,
            subject: "Bestätige deine E-Mail Adresse",
            html: confirmEmailTemplateCustomer(url),
          }, async (error, info) => {
            if (error) {
              console.log("**********************olmadi email: " + error.toString());
            } else {
              console.log("************gönderildi");
              await info

              if (j == findCustomer.length - 1) {
                await transporter.close();
              }
            }
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = {
  start
};