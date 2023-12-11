const knex = require('../db/db');
const getUserId = require('../utils/getId');
const bcrypt = require('bcrypt');
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
// const invoiceTemplate = require('../template/invoices/');
const createError = require('http-errors');
const axios = require('axios').default;
const { validationResult } = require('express-validator');


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



const tokenDuration = '3h';
const refreshTokenDuration = '90d';
const hashNumber = 12;


const getAllAdvertiser = async (req, res, next) => {
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
            const allAdvertisers = await knex(advertiser).orderBy('created_at', 'desc').returning('*');
            res.json(allAdvertisers);
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

const findMe = async (req, res, next) => {
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

          res.json({
            token: token.generate(await findAdvertiser[0], tokenDuration),
            refreshToken: refreshToken.generate(await findAdvertiser[0], refreshTokenDuration),
            advertiser: await findAdvertiser[0],
          });

        }
      } catch (error) {
        next(createError(400, 'Bad request!'));
      }
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const findAdvertiserPanel = async (req, res, next) => {
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
            const findAdvertiser = await knex(advertiser).where({ id: req.params.identifier }).returning('*');
            if (findAdvertiser.length === 0) {
              next(createError(404, 'Not Found!'));
            } else {
              res.json(findAdvertiser[0]);

            }
          } catch (error) {
            next(createError(404, 'Not Found!'));
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

const findAdvertisersEmail = async (req, res, next) => {
  const permission = await req.headers.permission;

  if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
    try {
      const findEmail = await knex(advertiser).where({ email: req.body.email }).returning('*');

      if (findEmail.length === 0) {
        next(createError(400, "Bad Request"));
      } else {
        res.json(findEmail[0]);
      }
    } catch (error) {
      next(createError(404, 'Not Found!'));
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const resetAdvertiserPassword = async (req, res, next) => {
  const permission = await req.headers.permission;
  if (permission === process.env.PERMISSION_KEY_ADVERTISER) {
    try {

      // FOUND ADVERTISER EMAIL
      const findAdvertiserEmail = await knex(advertiser).where({
        email: req.body.email,
        is_banned: false,
        is_active: true,
      }).returning('*');

      if (findAdvertiserEmail.length === 0) {
        // FOUND NOT ADVERTISER EMAIL
        next(createError(404, 'E-Mail not exist.'));
      } else {
        // FOUND ADVERTISER EMAIL
        const jwtInfos = {
          id: findAdvertiserEmail[0].id,
        };
        const secret = process.env.UPDATE_PW_ADVERTISER_SECRET + "-" + findAdvertiserEmail[0].password;
        const jwtToken = jwt.sign(jwtInfos, secret, { expiresIn: "1h" });


        const url = process.env.WEB_SITE_URL + 'updatePwAdvertiser/' + findAdvertiserEmail[0].id + '/' + jwtToken;


        let transporter = nodemailer.createTransport({
          host: process.env.MAIL_SERVICE,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PW
          }
        });

        transporter.sendMail({
          from: 'NowNow <no_reply@nownow.de>',
          to: findAdvertiserEmail[0].email.trim(),
          subject: "Reset Password",
          html: resetPasswordTemplate(url),

        }, async (error, info) => {
          if (error) {
            console.log(error);
          } else {
            console.log("************gönderildi");

            transporter.close();
          }
        });

        await res.json(await findAdvertiserEmail[0]);
      }

    } catch (error) {
      next(error);
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const createAdvertiser = async (req, res, next) => {
  const permission = await req.headers.permission;
  if (permission === process.env.PERMISSION_KEY_ADVERTISER) {
    const isEmail = validator.isEmail(req.body.email);
    const validatePasswordOptions = {
      minLength: 6,
      minLowercase: 0,
      minUppercase: 0,
      minNumbers: 0,
      minSymbols: 0,
      returnScore: false,
      pointsPerUnique: 0,
      pointsPerRepeat: 0,
      pointsForContainingLower: 0,
      pointsForContainingUpper: 0,
      pointsForContainingNumber: 0,
      pointsForContainingSymbol: 0,
    };

    const isStrongPassword = validator.isStrongPassword(req.body.password, validatePasswordOptions);


    if (!isEmail || !isStrongPassword) {
      if (!isEmail) {
        next(createError(406, "E-Mail is not valid!"));
      }
      if (!isStrongPassword) {
        next(createError(406, "Min. Length of Password: 6"));
      }
    } else {
      try {
        const findAdvertiser = await knex(advertiser).where({ email: req.body.email }).returning('id');


        if (await findAdvertiser.length === 0) {

          // const data = {
          //   "surename": req.body.firstname,
          //   "familyname": req.body.lastname,
          //   "category": {
          //     "id": 1,
          //     "objectName": "Category",
          //   },
          //   "birthday": req.body.birth_date,
          //   "bankAccount": req.body.iban,
          //   "taxNumber": req.body.tax_id,
          // };


          // try {
          //   const sevDeskUser = await axios.request({
          //     method: 'POST',
          //     data,
          //     headers: {
          //       'Content-Type': 'application/json',
          //       'Authorization': process.env.SEVDESK_API_TOKEN.toString(),
          //     },
          //     url: process.env.SEVDESK_HTTPS_ENDPOINT + '/Contact'
          //   });


          const newAdvertiser = await knex(advertiser).insert({
            ...req.body,
            sevdesk_id: /*parseInt(await sevDeskUser.data.objects.id)*/ 1,
            password: await bcrypt.hash(req.body.password, hashNumber),
          }).returning('*');


          // const comWayData = {
          //   "contact": {
          //     "id": parseInt(await sevDeskUser.data.objects.id),
          //     "objectName": "Contact",
          //   },
          //   "type": "EMAIL",
          //   "value": req.body.email,
          //   "key": {
          //     "id": 2,
          //     "ojectName": "CommunicationWayKey"
          //   }
          // }

          // try {
          //   await axios.request({
          //     method: 'POST',
          //     data: comWayData,
          //     headers: {
          //       'Content-Type': 'application/json',
          //       'Authorization': process.env.SEVDESK_API_TOKEN.toString(),
          //     },
          //     url: process.env.SEVDESK_HTTPS_ENDPOINT + '/CommunicationWay'
          //   });
          // } catch (error) {
          //   next(error);
          // }

          // if (req.body.phone != null && req.body.phone != "") {

          //   const comWayDataPhone = {
          //     "contact": {
          //       "id": parseInt(await sevDeskUser.data.objects.id),
          //       "objectName": "Contact",
          //     },
          //     "type": "PHONE",
          //     "value": req.body.phone,
          //     "key": {
          //       "id": 1,
          //       "ojectName": "CommunicationWayKey"
          //     }
          //   }
          //   try {

          //     await axios.request({
          //       method: 'POST',
          //       data: comWayDataPhone,
          //       headers: {
          //         'Content-Type': 'application/json',
          //         'Authorization': process.env.SEVDESK_API_TOKEN.toString(),
          //       },
          //       url: process.env.SEVDESK_HTTPS_ENDPOINT + '/CommunicationWay'
          //     });
          //   } catch (error) {
          //     next(error);
          //   }
          // }

          if (await newAdvertiser.length === 0) {
            next(createError(400, "Sign Up failed!"));
          } else {

            const jwtInfos = {
              id: await newAdvertiser[0].id.trim(),
              email: newAdvertiser[0].email.trim()
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

            transporter.sendMail({
              from: 'Test <no_reply@test.de>',
              to: newAdvertiser[0].email.trim(),
              subject: "Bestätige deine E-Mail Adresse",
              html: confirmEmailTemplate(url),

            }, async (error, info) => {
              if (error) {
                console.log(error);
              } else {
                console.log("************abgeschickt");

                transporter.close();
              }
            });
            await res.json({
              advertiser: await newAdvertiser[0],
              token: token.generate(await newAdvertiser[0], tokenDuration),
              refreshToken: refreshToken.generate(await newAdvertiser[0], refreshTokenDuration)
            });
          }

          // } catch (error) {
          //   next(error);
          // }

        } else {
          next(createError(406, "Email is already asigned!"));
        }

      } catch (error) {
        next(error);
      }
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const signInAdvertiser = async (req, res, next) => {
  const permission = await req.headers.permission;
  if (permission === process.env.PERMISSION_KEY_ADVERTISER) {
    const isEmail = validator.isEmail(req.body.email);
    if (!isEmail) {
      next(createError(406, "Not a valid E-Mail."));
    } else {

      try {
        const findAdvertiser = await knex(advertiser).where({ email: req.body.email }).returning('*');

        if (await findAdvertiser.length === 0) {
          next(createError(406, "Wrong e-mail or password."));
        } else {


          if (await !findAdvertiser[0].is_deleted) {
            if (!findAdvertiser[0].is_banned) {
              const validPassword = await bcrypt.compare(req.body.password, findAdvertiser[0].password);

              if (!validPassword) {
                next(createError(406, "Wrong e-mail or password."));
              } else {
                res.json({
                  token: token.generate(await findAdvertiser[0], tokenDuration),
                  refreshToken: refreshToken.generate(await findAdvertiser[0], refreshTokenDuration),
                  advertiser: await findAdvertiser[0]
                });
              }
            } else {
              next(createError(401, 'Your account is banned!'));
            }
          } else {
            if (!findAdvertiser[0].is_banned) {
              const id = await findAdvertiser[0].id;
              try {
                const newAdvertiser = await knex(advertiser).update({
                  is_deleted: false,
                })
                  .where({ id: id })
                  .returning('*');

                if (await newAdvertiser.length === 0) {
                  next(createError(400, "Login Failed!"));
                } else {
                  try {
                    await knex(address).update({
                      is_deleted: false
                    })
                      .where({ advertiser_id: id });
                  } catch (error) {
                    next(error);
                  }
                  try {
                    await knex(favorite_addresses).update({
                      is_deleted: false
                    })
                      .where({ advertiser_id: id });
                  } catch (error) {
                    next(error);
                  }
                  try {
                    await knex(favorite_advertiser).update({
                      is_deleted: false
                    })
                      .where({ advertiser_id: id });
                  } catch (error) {
                    next(error);
                  }
                  try {
                    await knex(invoice_address).update({
                      is_deleted: false
                    })
                      .where({ advertiser_id: id });
                  } catch (error) {
                    next(error);
                  }
                  const validPassword = await bcrypt.compare(req.body.password, await newAdvertiser[0].password);

                  if (!validPassword) {
                    next(createError(406, "Wrong e-mail or password."));
                  } else {
                    res.json({
                      token: token.generate(await newAdvertiser[0], tokenDuration),
                      refreshToken: refreshToken.generate(await newAdvertiser[0], refreshTokenDuration),
                      advertiser: await newAdvertiser[0]
                    });
                  }
                }
              } catch (error) {
                next(error);
              }
            } else {
              next(createError(401, 'Your account is banned!'));
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

const deleteAdvertiser = async (req, res, next) => {
  const id = await getUserId(req);
  const permission = await req.headers.permission;
  if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_WORKER) {

    if (id == null) {
      next(createError(401, 'Permission denied!'));
    } else {


      try {

        const findInWorkers = await knex(worker).where({ id }).returning('*');


        const findInAdvertisers = await knex(advertiser).where({ id: req.params.identifier }).returning('*');


        if (findInWorkers.length === 0) {
          next(createError(401, 'Permission denied!'));
        } else {
          if (findInAdvertisers.length === 0) {
            next(createError(404, 'Not Found!'));
          } else {
            try {
              await knex(advertiser).del().where({ id: req.params.identifier });
            } catch (error) {
              next(error);
            }

            res.json(findInAdvertisers[0]);
          }
        }
      } catch (error) {
        next(createError(400, 'Not found!'));
      }
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const deleteAdvertiserSelf = async (req, res, next) => {
  const id = await getUserId(req);
  const permission = await req.headers.permission;
  if (permission === process.env.PERMISSION_KEY_ADVERTISER) {
    if (id == null) {
      next(createError(401, 'Permission denied!'));
    } else {
      try {

        const findInAdvertisers = await knex(advertiser).where({ id }).returning('*');

        if (findInAdvertisers.length === 0) {
          next(createError(401, 'Permission denied!'));
        } else {
          res.json(findInAdvertisers[0]);
          try {
            await knex(advertiser).del().where({ id: id });
          } catch (error) {
            next(error);
          }

        }
      } catch (error) {
        next(createError(400, 'Not found!'));
      }
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const updateAdvertiser = async (req, res, next) => {
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
            let updatedAdvertiser;
            if (req.body.password == null || req.body.password == "") {
              updatedAdvertiser = await knex(advertiser)
                .where({
                  id: id
                })
                .update({
                  ...req.body,
                  last_update_from_user_id: id
                })
                .returning('*');
            }

            if (req.body.password != null && req.body.password != "") {
              updatedAdvertiser = await knex(advertiser)
                .where({
                  id: id
                })
                .update({
                  ...req.body,
                  password: await bcrypt.hash(req.body.password, hashNumber),
                  last_update_from_user_id: id
                })
                .returning('*');
            }

            if (await updatedAdvertiser.length === 0) {

              next(createError(400, 'Bad Request'));
            } else {
              const advertiser_id = await updatedAdvertiser[0].id;
              let from = DateTime.fromObject({ year: DateTime.now().year, month: DateTime.now().month, day: 1 }).toISO().toString();
              let to = DateTime.now().plus({ minutes: 3 }).toISO().toString();
              if (!updatedAdvertiser[0].is_active) {
                try {
                  await knex(stad).where({ is_deleted: false }).where({ advertiser_id: advertiser_id }).update({ is_deleted: true, last_update_from_user_id: id }).returning('id');
                } catch (error) {
                  next(error);
                }
                try {
                  await knex(qroffer).where({ advertiser_id: advertiser_id }).update({ is_deleted: true, is_expired: true, last_update_from_user_id: id }).returning('id');;
                } catch (error) {
                  next(error);
                }
                try {
                  await knex(wallet).where({ advertiser_id: advertiser_id }).update({ is_deleted_advertiser: true, is_expired: true, last_update_from_user_id: id });
                } catch (error) {
                  next(error);
                }
                try {
                  const findStads = await knex(stad).where({
                    is_deleted: true,
                    is_archive: false,
                    advertiser_id: advertiser_id
                  }).whereBetween("created_at", [from, to])
                    .returning('*');

                  try {
                    const findQroffer = await knex(qroffer).where({
                      is_deleted: true,
                      is_archive: false,
                      advertiser_id: advertiser_id
                    }).whereBetween("created_at", [from, to])
                      .returning('*');


                    try {
                      const findInvoiceAddresses = await knex(invoice_address).where({ advertiser_id: advertiser_id }).returning('*');


                      if (await findQroffer.length !== 0 || await findStads.length !== 0) {
                        if (await findInvoiceAddresses.length === 0) {
                          console.log("Error Invoice Address.");
                        } else {


                          for (let i = 0; i < findInvoiceAddresses.length; i++) {

                            try {
                              const findQrs = await knex(qroffer).where({
                                is_deleted: true,
                                is_archive: false,
                                advertiser_id: advertiser_id,
                                invoice_address_id: findInvoiceAddresses[i].id
                              }).whereBetween("created_at", [from, to])
                                .returning('*');



                              try {
                                const findShortTimeAdvertisements = await knex(stad).where({
                                  is_deleted: true,
                                  is_archive: false,
                                  advertiser_id: advertiser_id,
                                  invoice_address_id: findInvoiceAddresses[i].id
                                }).whereBetween("created_at", [from, to])
                                  .returning('*');


                                try {
                                  const findAdvertiserIban = await knex(stad).where({ id: await findInvoiceAddresses.advertiser_id }).returning('iban');

                                  try {
                                    const lastNumber = await knex(invoice).count('*').first();


                                    let salesTax = await SalesTax.getSalesTax(findInvoiceAddresses[i].country_code);

                                    let rate = salesTax.rate;


                                    // let data = {
                                    //   id: await findInvoiceAddresses[i].id,
                                    //   invoiceBig: "RECHNUNG",
                                    //   company_name: await findInvoiceAddresses[i].company_name,
                                    //   gender: await findInvoiceAddresses[i].gender,
                                    //   firstname: await findInvoiceAddresses[i].firstname,
                                    //   lastname: await findInvoiceAddresses[i].lastname,
                                    //   street: await findInvoiceAddresses[i].street,
                                    //   postcode: await findInvoiceAddresses[i].postcode,
                                    //   city: await findInvoiceAddresses[i].city,
                                    //   country: await findInvoiceAddresses[i].country,
                                    //   floor: await findInvoiceAddresses[i].floor == null ? "" : " Stock: " + await findInvoiceAddresses[i].floor,
                                    //   phone: await findInvoiceAddresses[i].phone,
                                    //   invoicenumber: "NNA-000" + (await lastNumber + process.env.INVOICE_NUMBER).toString(),
                                    //   email: await findInvoiceAddresses[i].email,
                                    //   invoicenumberString: "Rechnungsnummer",
                                    //   greeting: "Sehr geehrte/r Advertiser/in " + await findInvoiceAddresses[i].firstname + " " + await findInvoiceAddresses[i].lastname,
                                    //   beginingText: "Vielen Dank für Ihr Vertrauen in die NowNow GmbH. Wir stellen Ihnen hiermit folgende Leistungen in Rechnung:",
                                    //   lastText: "Wir werden den Gesamtbetrag von Ihrem Bankkonto mit der IBAN: " + await findAdvertiserIban[0].iban + " abbuchen.",
                                    //   sayCiao: "Mit freundlichen Grüßen",
                                    //   percent: (rate * 100) + " %",
                                    //   stads: await findShortTimeAdvertisements,
                                    //   qroffer: await findQrs,
                                    // }
                                    // var options = {
                                    //   convertTo: 'pdf' //can be docx, txt, ...
                                    // };

                                    // carbone.render('../../../template/NowNow_Rechnung.docx', data, options, async function (err, result) {
                                    //   if (err) {
                                    //     return console.log(err);
                                    //   }

                                    //   const storage = new Storage({ projectId: process.env.GCLOUD_PROJECT, credentials: { client_email: process.env.GCLOUD_CLIENT_EMAIL, private_key: process.env.GCLOUD_PRIVATE_KEY } });



                                    //   const bucket = storage.bucket(process.env.GCS_BUCKET);


                                    //   let fileName = `${DateTime.now().year}-${(DateTime.now().month).toLocaleString("en-US", { minimumIntegerDigits: 2 })}_${findInvoiceAddresses[i].advertiser_id}_${findInvoiceAddresses[i].address_id}_${findInvoiceAddresses[i].lastname}_${findInvoiceAddresses[i].firstname}.pdf`;
                                    //   const blob = await bucket.file(fileName);



                                    //   const passthroughStream = new stream.PassThrough();
                                    //   passthroughStream.write(result);
                                    //   passthroughStream.end();

                                    //   async function streamFileUpload() {
                                    //     passthroughStream.pipe(blob.createWriteStream()).on('finish', () => {
                                    //       // The file upload is complete
                                    //     });
                                    //   }

                                    //   await streamFileUpload().catch(console.error);
                                    //   // [END storage_stream_file_upload]

                                    //   await fs.writeFileSync(`../../../docs/${fileName}`, result);
                                    //   let transporter = nodemailer.createTransport({
                                    //     host: process.env.MAIL_SERVICE,
                                    //     auth: {
                                    //       user: process.env.MAIL_USER,
                                    //       pass: process.env.MAIL_PW
                                    //     }
                                    //   });


                                    //   let mailOptions = {
                                    //     from: 'NowNow <no_reply@nownow.de>',
                                    //     to: await findInvoiceAddresses[i].email,
                                    //     subject: `Deine Now Now Rechnung: ${(DateTime.now().month).toLocaleString("en-US", { minimumIntegerDigits: 2 })}/${DateTime.now().year}`,
                                    //     html: invoiceTemplate(findInvoiceAddresses[i]),
                                    //     attachments: [{ filename: fileName, path: `./docs/${fileName}` }]
                                    //   }


                                    //   await transporter.sendMail(mailOptions, async (error, info) => {
                                    //     if (error) {
                                    //       console.log("**********************olmadi email: " + error.toString());
                                    //     } else {


                                    //       console.log("************gönderildi");
                                    //       await info

                                    //       await transporter.close();

                                    //       const directory = './docs';

                                    //       fs.readdir(directory, (err, files) => {
                                    //         if (err) throw err;

                                    //         for (const file of files) {
                                    //           fs.unlink(path.join(directory, file), err => {
                                    //             if (err) throw err;
                                    //           });
                                    //         }
                                    //       });
                                    //     }
                                    //   });

                                    // });


                                    // await knex(invoice).insert({
                                    //   advertiserId: await advertiser_id,
                                    //   invoice_address_id: await findInvoiceAddresses[i].id,
                                    //   is_done: true,
                                    //   invoicenumber: await lastNumber + process.env.INVOICE_NUMBER
                                    // });
                                  } catch (error) {
                                    next(error);
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
                          try {
                            await knex(address).where({
                              advertiser_id: advertiser_id,
                            }).update({
                              is_deleted: true,
                              last_update_from_user_id: id
                            });
                          } catch (error) {
                            next(error);
                          }
                          try {
                            await knex(favorite_addresses).whereIn('address_id', await knex(address).select('id').where('advertiser_id', advertiser_id)).update({
                              is_deleted: true
                            })
                          } catch (error) {
                            next(error);
                          }
                          try {
                            await knex(favorite_advertiser).where({
                              advertiser_id: advertiser_id
                            }
                            ).update({
                              is_deleted: true,
                              last_update_from_user_id: id
                            })
                          } catch (error) {
                            next(error);
                          }
                        }
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

              res.json({
                advertiser: await updatedAdvertiser[0],
                token: token.generate(await updatedAdvertiser[0], tokenDuration),
                refreshToken: refreshToken.generate(await updatedAdvertiser[0], refreshTokenDuration),
              });
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

const updatePasswordAdvertiser = async (req, res, next) => {
  const id = await getUserId(req);

  const permission = await req.headers.permission;
  if (permission === process.env.PERMISSION_KEY_ADVERTISER) {
    if (id == null) {
      next(createError(401, 'Permission denied!'));
    } else {
      try {

        const findInAdvertisers = await knex(advertiser).where({ id }).returning('id');


        if (await findInAdvertisers.length === 0) {
          next(createError(401, 'Permission denied!'));
        } else {

          try {
            const updatedAdvertiser = await knex(advertiser).where({ id }).update({
              password: await bcrypt.hash(req.body.password, hashNumber)
            }).returning('*');


            if (await updatedAdvertiser.length === 0) {
              next(createError(400, 'Update Password Failed!'));
            } else {
              res.json({
                advertiser: await updatedAdvertiser[0],
                token: token.generate(await updatedAdvertiser[0], tokenDuration),
                refreshToken: refreshToken.generate(await updatedAdvertiser[0], refreshTokenDuration),
              });
            }
          } catch (error) {
            next(error);
          }
        }
      } catch (error) {
        next(createError(400, 'Not found!'));
      }
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const updateAdvertiserWithoutPasswordInPanel = async (req, res, next) => {
  const id = await getUserId(req);

  const permission = await req.headers.permission;
  if (permission === process.env.PERMISSION_KEY_WORKER) {
    if (id == null) {
      next(createError(401, 'Permission denied!'));
    } else {


      try {
        const findInWorkers = await knex(worker).where({ id }).returning('id');



        if (await findInWorkers.length === 0) {
          next(createError(401, 'Permission denied!'));
        } else {


          try {
            const updatedAdvertiser = await knex(advertiser).where({ id: req.body.advertiser_id }).update({ ...req.body, last_update_from_user_id: id }).returning('*');

            if (await updatedAdvertiser.length === 0) {
              next(createError(400, 'Update Advertiser Failed!'));
            } else {
              const advertiser_id = await updatedAdvertiser[0].id;
              let from = DateTime.fromObject({ year: DateTime.now().year, month: DateTime.now().month, day: 1 }).toISO().toString();
              let to = DateTime.now().plus({ minutes: 3 }).toISO().toString();
              if (!updatedAdvertiser[0].is_active) {
                try {
                  await knex(stad).where({ is_deleted: false }).where({ advertiser_id: advertiser_id }).update({ is_deleted: true, last_update_from_user_id: id }).returning('id');
                } catch (error) {
                  next(error);
                }
                try {
                  await knex(qroffer).where({ advertiser_id: advertiser_id }).update({ is_deleted: true, is_expired: true, last_update_from_user_id: id }).returning('id');;
                } catch (error) {
                  next(error);
                }
                try {
                  await knex(wallet).where({ advertiser_id: advertiser_id }).update({ is_deleted_advertiser: true, is_expired: true, last_update_from_user_id: id });
                } catch (error) {
                  next(error);
                }
                try {
                  const findStads = await knex(stad).where({
                    is_deleted: true,
                    is_archive: false,
                    advertiser_id: advertiser_id
                  }).whereBetween("created_at", [from, to])
                    .returning('*');

                  try {
                    const findQroffer = await knex(qroffer).where({
                      is_deleted: true,
                      is_archive: false,
                      advertiser_id: advertiser_id
                    }).whereBetween("created_at", [from, to])
                      .returning('*');


                    try {
                      const findInvoiceAddresses = await knex(invoice_address).where({ advertiser_id: advertiser_id }).returning('*');


                      if (await findQroffer.length !== 0 || await findStads.length !== 0) {
                        if (await findInvoiceAddresses.length === 0) {
                          console.log("Error Invoice Address.");
                        } else {


                          for (let i = 0; i < findInvoiceAddresses.length; i++) {


                            try {
                              const findQrs = await knex(qroffer).where({
                                is_deleted: true,
                                is_archive: false,
                                advertiser_id: advertiser_id,
                                invoice_address_id: findInvoiceAddresses[i].id
                              }).whereBetween("created_at", [from, to])
                                .returning('*');



                              try {
                                const findShortTimeAdvertisements = await knex(stad).where({
                                  is_deleted: true,
                                  is_archive: false,
                                  advertiser_id: advertiser_id,
                                  invoice_address_id: findInvoiceAddresses[i].id
                                }).whereBetween("created_at", [from, to])
                                  .returning('*');


                                try {
                                  const findAdvertiserIban = await knex(stad).where({ id: findInvoiceAddresses.advertiser_id }).returning('iban');

                                  try {
                                    const lastNumber = await knex(invoice).count('*').first();


                                    let salesTax = await SalesTax.getSalesTax(findInvoiceAddresses[i].country_code);

                                    let rate = salesTax.rate;


                                    // let data = {
                                    //   id: await findInvoiceAddresses[i].id,
                                    //   invoiceBig: "RECHNUNG",
                                    //   company_name: await findInvoiceAddresses[i].company_name,
                                    //   gender: await findInvoiceAddresses[i].gender,
                                    //   firstname: await findInvoiceAddresses[i].firstname,
                                    //   lastname: await findInvoiceAddresses[i].lastname,
                                    //   street: await findInvoiceAddresses[i].street,
                                    //   postcode: await findInvoiceAddresses[i].postcode,
                                    //   city: await findInvoiceAddresses[i].city,
                                    //   country: await findInvoiceAddresses[i].country,
                                    //   floor: await findInvoiceAddresses[i].floor == null ? "" : " Stock: " + await findInvoiceAddresses[i].floor,
                                    //   phone: await findInvoiceAddresses[i].phone,
                                    //   invoicenumber: "NNA-000" + (await lastNumber + process.env.INVOICE_NUMBER).toString(),
                                    //   email: await findInvoiceAddresses[i].email,
                                    //   invoicenumberString: "Rechnungsnummer",
                                    //   greeting: "Sehr geehrte/r Advertiser/in " + findInvoiceAddresses[i].firstname + " " + findInvoiceAddresses[i].lastname,
                                    //   beginingText: "Vielen Dank für Ihr Vertrauen in die NowNow GmbH. Wir stellen Ihnen hiermit folgende Leistungen in Rechnung:",
                                    //   lastText: "Wir werden den Gesamtbetrag von Ihrem Bankkonto mit der IBAN: " + findAdvertiserIban[0].iban + " abbuchen.",
                                    //   sayCiao: "Mit freundlichen Grüßen",
                                    //   percent: (rate * 100) + " %",
                                    //   stads: await findShortTimeAdvertisements,
                                    //   qroffer: await findQrs,
                                    // }
                                    // var options = {
                                    //   convertTo: 'pdf' //can be docx, txt, ...
                                    // };

                                    // carbone.render('../../../template/NowNow_Rechnung.docx', data, options, async function (err, result) {
                                    //   if (err) return console.log(err);

                                    //   const storage = new Storage({ projectId: process.env.GCLOUD_PROJECT, credentials: { client_email: process.env.GCLOUD_CLIENT_EMAIL, private_key: process.env.GCLOUD_PRIVATE_KEY } });



                                    //   const bucket = storage.bucket(process.env.GCS_BUCKET);


                                    //   let fileName = `${DateTime.now().year}-${(DateTime.now().month).toLocaleString("en-US", { minimumIntegerDigits: 2 })}_${findInvoiceAddresses[i].advertiser_id}_${findInvoiceAddresses[i].address_id}_${findInvoiceAddresses[i].lastname}_${findInvoiceAddresses[i].firstname}.pdf`;
                                    //   const blob = await bucket.file(fileName);



                                    //   const passthroughStream = new stream.PassThrough();
                                    //   passthroughStream.write(result);
                                    //   passthroughStream.end();

                                    //   async function streamFileUpload() {
                                    //     passthroughStream.pipe(blob.createWriteStream()).on('finish', () => {
                                    //       // The file upload is complete
                                    //     });
                                    //   }

                                    //   await streamFileUpload().catch(console.error);
                                    //   // [END storage_stream_file_upload]

                                    //   await fs.writeFileSync(`../../../docs/${fileName}`, result);
                                    //   let transporter = nodemailer.createTransport({
                                    //     host: process.env.MAIL_SERVICE,
                                    //     auth: {
                                    //       user: process.env.MAIL_USER,
                                    //       pass: process.env.MAIL_PW
                                    //     }
                                    //   });


                                    //   let mailOptions = {
                                    //     from: 'NowNow - No Reply! <no_reply@nownow.de>',
                                    //     to: await findInvoiceAddresses[i].email,
                                    //     subject: `Deine Now Now Rechnung: ${(DateTime.now().month).toLocaleString("en-US", { minimumIntegerDigits: 2 })}/${DateTime.now().year}`,
                                    //     html: invoiceTemplate(findInvoiceAddresses[i]),
                                    //     attachments: [{ filename: fileName, path: `./docs/${fileName}` }]
                                    //   }


                                    //   await transporter.sendMail(mailOptions, async (error, info) => {
                                    //     if (error) {
                                    //       console.log("**********************olmadi email: " + error.toString());
                                    //     } else {


                                    //       console.log("************gönderildi");
                                    //       await info

                                    //       await transporter.close();

                                    //       const directory = './docs';

                                    //       fs.readdir(directory, (err, files) => {
                                    //         if (err) throw err;

                                    //         for (const file of files) {
                                    //           fs.unlink(path.join(directory, file), err => {
                                    //             if (err) throw err;
                                    //           });
                                    //         }
                                    //       });
                                    //     }
                                    //   });

                                    // });

                                    await knex(invoice).insert({
                                      advertiserId: advertiser_id,
                                      invoice_address_id: findInvoiceAddresses[i].id,
                                      is_done: true,
                                      invoicenumber: lastNumber + process.env.INVOICE_NUMBER
                                    });
                                  } catch (error) {
                                    next(error);
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
                          try {
                            await knex(address).where({
                              advertiser_id: advertiser_id,
                            }).update({
                              is_deleted: true,
                              last_update_from_user_id: id
                            });
                          } catch (error) {
                            next(error);
                          }
                          try {
                            await knex(favorite_addresses).whereIn('address_id', await knex(address).select('id').where('advertiser_id', advertiser_id)).update({
                              is_deleted: true
                            })
                          } catch (error) {
                            next(error);
                          }
                          try {
                            await knex(favorite_advertiser).where({
                              advertiser_id: advertiser_id
                            }
                            ).update({
                              is_deleted: true,
                              last_update_from_user_id: id
                            })
                          } catch (error) {
                            next(error);
                          }
                        }
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

              res.json({
                advertiser: await updatedAdvertiser[0],
                token: token.generate(await updatedAdvertiser[0], tokenDuration),
                refreshToken: refreshToken.generate(await updatedAdvertiser[0], refreshTokenDuration),
              });
            }
          } catch (error) {
            next(error);
          }
        }
      } catch (error) {
        next(createError(400, 'Not found!'));
      }
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const tkn = req.query.id;
    if (tkn) {
      jwt.verify(tkn, process.env.CONFIRM_MAIL_SECRET, async (e, decoded) => {
        if (e) {
          res.redirect('/tokeninvalid');
        } else {
          const idInToken = decoded.id;
          let findAdvertiser;

          let findCustomer;

          try {
            findAdvertiser = await knex("Advertiser").where({ id: idInToken }).returning('*');
          } catch (error) {
            next(error);
          }
          try {
            findCustomer = await knex("Customer").where({ id: idInToken }).returning('*');
          } catch (error) {
            next(error);
          }

          if (findAdvertiser.length !== 0) {
            let updatedAdvertiser;
            try {
              updatedAdvertiser = await knex("Advertiser").where({ id: idInToken }).update({
                email_confirmed: true
              }).returning('*');
            } catch (error) {
              next(error);
            }


            if (updatedAdvertiser.length !== 0) {
              res.redirect('/emailActivated');
            } else {
              res.redirect('/tokeninvalid');
            }
          } else {
            if (findCustomer.length !== 0) {
              let updatedCustomer
              try {
                updatedCustomer = await knex("Customer").where({ id: idInToken }).update({
                  email_confirmed: true
                }).returning('*');
              } catch (error) {
                next(error);
              }
              if (updatedCustomer.length !== 0) {
                res.redirect('/emailActivated');
              } else {
                res.redirect('/tokeninvalid');
              }
            }
          }
        }
      });
    } else {
      res.redirect('/tokeninvalid');

    }
  } catch (error) {
    next(error);
  }
};

const updateAdvertiserPassword = async (req, res, next) => {
  try {

    const tkn = req.params.token.trim();
    const id = req.params.id.trim();



    if (tkn && id) {
      let findAdvertiser;
      try {
        findAdvertiser = await knex("Advertiser").where({ id: id }).returning('*');
      } catch (error) {
        next(error);
      }


      if (findAdvertiser.length !== 0) {
        const secret = process.env.UPDATE_PW_ADVERTISER_SECRET + "-" + findAdvertiser[0].password;
        jwt.verify(tkn, secret, async (e, decoded) => {
          if (e) {
            res.redirect('/tokeninvalid');
          } else {

            res.render('../views/forget_password_advertiser.ejs', { id: id, token: tkn, layout: '../views/layout/password_layout.ejs' });

          }
        });
      } else {
        res.redirect('/tokeninvalid');
      }
    } else {
      res.redirect('/tokeninvalid');
    }
  } catch (error) {
    res.redirect('/tokeninvalid');
    next(error);
  }
};

const saveAdvertiserPassword = async (req, res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {


    req.flash('validation_error', validationErrors.array());
    req.flash('password', req.body.password);
    req.flash('repeatPassword', req.body.repeatPassword);

    res.redirect('/updatePwAdvertiser/' + req.body.id.trim() + '/' + req.body.token.trim());

  } else {
    try {
      let findAdvertiser;
      try {
        findAdvertiser = await knex("Advertiser").where({ id: req.body.id.trim() }).returning('*');
      } catch (error) {
        next(error);
      }

      if (findAdvertiser.length !== 0) {
        const hashedPassword = await bcrypt.hash(req.body.password, hashNumber);
        let resultAdvertiser;
        try {
          resultAdvertiser = await await knex("Advertiser").where({ id: req.body.id.trim() }).update({
            password: hashedPassword,
          }).returning('*');
        } catch (error) {
          next(error);
        }

        if (resultAdvertiser.length !== 0) {
          res.redirect('/passwordsvd');
        } else {
          res.redirect('/passwordError');
        }
      }
    } catch (e) {
      res.redirect('/passwordError');
    }
  }
};

const passwordSaved = async (req, res, next) => {
  res.render('../views/password-saved_successfully.ejs', { layout: '../views/layout/password_layout.ejs' });

};

const tokenInvalid = async (req, res, next) => {
  res.render('../views/password-token-invalid.ejs', { layout: '../views/layout/password_layout.ejs' });

};

const emailActivated = async (req, res, next) => {
  res.render('../views/email-activated.ejs', { layout: '../views/layout/password_layout.ejs' });

};

const passwordSaveError = async (req, res, next) => {
  res.render('../views/password-save_failed.ejs', { layout: '../views/layout/password_layout.ejs' });
};


module.exports = {
  getAllAdvertiser,
  findMe,
  findAdvertiserPanel,
  findAdvertisersEmail,
  resetAdvertiserPassword,
  createAdvertiser,
  signInAdvertiser,
  deleteAdvertiser,
  deleteAdvertiserSelf,
  updateAdvertiser,
  updatePasswordAdvertiser,
  updateAdvertiserWithoutPasswordInPanel,
  verifyEmail,
  updateAdvertiserPassword,
  saveAdvertiserPassword,
  passwordSaved,
  tokenInvalid,
  emailActivated,
  passwordSaveError,
}