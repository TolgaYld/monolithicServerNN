const bcrypt = require('bcrypt');
const { token, refreshToken } = require('../helpers/token');
const getUserId = require('../utils/getId');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const knex = require('../db/db');
const validator = require('validator');
const confirmEmailTemplate = require('../template/confirmEmailCustomerTemplate');
const resetPasswordEmailTemplate = require('../template/resetPasswordEmailCustomerTemplate');
const createError = require('http-errors');
const { validationResult } = require('express-validator');

///schemas
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


const tokenDuration = '3h';
const refreshTokenDuration = '90d';
const hashNumber = 12;


const getAllCustomer = async (req, res, next) => {
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
            const allCustomers = await knex(customer).orderBy('created_at', 'desc').returning('*');
            res.json(allCustomers);
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

const findMe = async (req, res, next) => {
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

          res.json({
            token: token.generate(await findCustomer[0], tokenDuration),
            refreshToken: refreshToken.generate(await findCustomer[0], refreshTokenDuration),
            customer: await findCustomer[0],
          });

        }
      } catch (error) {
        next(error);
      }
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const findCustomerPanel = async (req, res, next) => {
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

          const findCustomer = await knex(customer).where({ id: req.params.identifier }).returning('*');
          res.json(findCustomer[0]);

        }
      } catch (error) {
        next(error);
      }
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const findCustomersEmail = async (req, res, next) => {
  const permission = await req.headers.permission;
  if (permission === process.env.PERMISSION_KEY_CUSTOMER) {
    try {
      const findEmail = await knex(customer).where({ email: req.body.email }).returning('id');

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

const resetCustomerPassword = async (req, res, next) => {
  const permission = await req.headers.permission;
  if (permission === process.env.PERMISSION_KEY_CUSTOMER) {
    try {
      // FOUND ADVERTISER EMAIL
      const findCustomerEmail = await knex(customer).where({
        email: req.body.email,
        is_banned: false,
        is_active: true,
      }).returning('*');

      if (findCustomerEmail.length === 0) {
        // FOUND NOT ADVERTISER EMAIL
        next(createError(404, 'Not found!'));
      } else {
        // FOUND ADVERTISER EMAIL
        const jwtInfos = {
          id: findCustomerEmail[0].id,
        };
        const secret = process.env.UPDATE_PW_ADVERTISER_SECRET + "-" + findCustomerEmail[0].password;
        const jwtToken = jwt.sign(jwtInfos, secret, { expiresIn: "1h" });


        const url = process.env.WEB_SITE_URL + 'updatePwAdvertiser/' + findCustomerEmail[0].id + '/' + jwtToken;


        let transporter = nodemailer.createTransport({
          host: process.env.MAIL_SERVICE,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PW
          }
        });
        await transporter.sendMail({
          from: 'NowNow <noreply@nownow.de>',
          to: findCustomerEmail[0].email,
          subject: "Reset Password",
          html: resetPasswordEmailTemplate(url),
        }, (error, info) => {
          if (error) {
            console.log("**********************olmadi email: " + error.toString());
          }
          console.log("************gönderildi");

          transporter.close();
        });

        res.json(findCustomerEmail[0]);
      }


    } catch (error) {
      console.log("Advertiser not found!: " + error);
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const createCustomer = async (req, res, next) => {
  const permission = await req.headers.permission;
  if (permission === process.env.PERMISSION_KEY_CUSTOMER) {

    //Google
    if (await req.body.provider === 'Google') {
      try {
        if (await req.body.email != null) {
          const findCustomer = await knex(customer).where("email", await req.body.email.toLowerCase()).whereNot({ provider: 'Google', provider_id: await req.body.provider_id }).returning('*');

          if (await findCustomer.length === 0) {

            const alreadyExists = await knex(customer).where({ provider: 'Google', email: await req.body.email.toLowerCase().trim(), provider_id: await req.body.provider_id }).returning('*');

            if (alreadyExists.length === 0) {

              let pwdChars = "0123456789ABC&DEF+#GHIJKLM!NöOPQRST-Uü?$VWXYZabc_defghijklmnopqärstuvwxyz";
              let pwdLen = 21;
              let randPassword = Array(pwdLen).fill(pwdChars).map(function (x) { return x[Math.floor(Math.random() * x.length)] }).join('');

              const newCustomer = await knex(customer).insert({
                email: req.body.email.toLowerCase().trim(),
                password: await bcrypt.hash(randPassword, hashNumber),
                provider: 'Google',
                provider_id: req.body.provider_id,
              }).returning('*');
              if (newCustomer.length == 0) {
                next(createError(400, "Sign Up failed!"));

              } else {
                res.json({
                  customer: await newCustomer[0],
                  token: token.generate(await newCustomer[0], tokenDuration),
                  refreshToken: refreshToken.generate(await newCustomer[0], refreshTokenDuration)
                });
              }

            } else {
              if (!alreadyExists[0].is_deleted) {
                if (!alreadyExists[0].is_banned) {

                  res.json({
                    token: token.generate(await alreadyExists[0], tokenDuration),
                    refreshToken: refreshToken.generate(await alreadyExists[0], refreshTokenDuration),
                    customer: await alreadyExists[0],
                  });

                } else {
                  next(createError(401, 'Your account is banned!'));
                }
              } else {
                if (!alreadyExists[0].is_banned) {
                  const id = await alreadyExists[0].id;

                  try {
                    const newCustomer = await knex(customer).update({
                      is_active: true,
                      is_deleted: false,
                    }).where({ id: id }).returning('*');

                    if (await newCustomer.length === 0) {
                      next(createError(400, "Login failed."));
                    } else {
                      try {
                        await knex(favoriteCategorys).update({ is_deleted: false }).where({ customer_id: id });
                      } catch (err) {
                        next(err);
                      }
                      try {
                        await knex(favoriteAdvertiser).update({ is_deleted: false }).where({ customer_id: id });
                      } catch (err) {
                        next(err);
                      }
                      try {
                        await knex(favoriteAddresses).update({ is_deleted: false }).where({ customer_id: id });
                      } catch (err) {
                        next(err);
                      }
                      res.json({
                        token: token.generate(await newCustomer[0], tokenDuration),
                        refreshToken: refreshToken.generate(await newCustomer[0], refreshTokenDuration),
                        customer: await newCustomer[0],
                      });
                    }
                  } catch (error) {
                    next(error);
                  }
                } else {
                  next(createError(401, 'Your account is banned!'));
                }
              }
            }
          } else {
            if (await findCustomer[0].provider !== 'Google') {
              if (await findCustomer[0].provider === 'Apple') {
                next(createError(406, "Please Sign in with Apple"));
              }

              if (await findCustomer[0].provider === 'Facebook') {
                next(createError(406, "Please Sign in with Facebook"));
              }

              if (await findCustomer[0].provider === 'Local') {
                next(createError(406, "Please Sign in with Email & Password"));
              }
            }
          }
        }
      } catch (error) {
        next(error);
      }
    }

    // Facebook
    if (await req.body.provider === 'Facebook') {
      try {
        if (await req.body.email != null) {
          const findCustomer = await knex(customer).where("email", await req.body.email.toLowerCase()).whereNot({ provider: 'Facebook', provider_id: await req.body.provider_id }).returning('*');

          if (await findCustomer.length === 0) {

            const alreadyExists = await knex(customer).where({ provider: 'Facebook', email: await req.body.email.toLowerCase().trim(), provider_id: await req.body.provider_id }).returning('*');

            if (alreadyExists.length === 0) {

              let pwdChars = "0123456789ABC&DEF+#GHIJKLM!NöOPQRST-Uü?$VWXYZabc_defghijklmnopqärstuvwxyz";
              let pwdLen = 21;
              let randPassword = Array(pwdLen).fill(pwdChars).map(function (x) { return x[Math.floor(Math.random() * x.length)] }).join('');

              const newCustomer = await knex(customer).insert({
                email: req.body.email.toLowerCase().trim(),
                password: await bcrypt.hash(randPassword, hashNumber),
                provider: 'Facebook',
                provider_id: req.body.provider_id,
              }).returning('*');
              if (newCustomer.length == 0) {
                next(createError(400, "Sign Up failed!"));

              } else {
                res.json({
                  customer: await newCustomer[0],
                  token: token.generate(await newCustomer[0], tokenDuration),
                  refreshToken: refreshToken.generate(await newCustomer[0], refreshTokenDuration)
                });
              }

            } else {
              if (!alreadyExists[0].is_deleted) {
                if (!alreadyExists[0].is_banned) {

                  res.json({
                    token: token.generate(await alreadyExists[0], tokenDuration),
                    refreshToken: refreshToken.generate(await alreadyExists[0], refreshTokenDuration),
                    customer: await alreadyExists[0],
                  });

                } else {
                  next(createError(401, 'Your account is banned!'));
                }
              } else {
                if (!alreadyExists[0].is_banned) {
                  const id = await alreadyExists[0].id;

                  try {
                    const newCustomer = await knex(customer).update({
                      is_active: true,
                      is_deleted: false,
                    }).where({ id: id }).returning('*');

                    if (await newCustomer.length === 0) {
                      next(createError(400, "Login failed."));
                    } else {
                      try {
                        await knex(favoriteCategorys).update({ is_deleted: false }).where({ customer_id: id });
                      } catch (err) {
                        next(err);
                      }
                      try {
                        await knex(favoriteAdvertiser).update({ is_deleted: false }).where({ customer_id: id });
                      } catch (err) {
                        next(err);
                      }
                      try {
                        await knex(favoriteAddresses).update({ is_deleted: false }).where({ customer_id: id });
                      } catch (err) {
                        next(err);
                      }
                      res.json({
                        token: token.generate(await newCustomer[0], tokenDuration),
                        refreshToken: refreshToken.generate(await newCustomer[0], refreshTokenDuration),
                        customer: await newCustomer[0],
                      });
                    }
                  } catch (error) {
                    next(error);
                  }
                } else {
                  next(createError(401, 'Your account is banned!'));
                }
              }
            }
          } else {
            if (await findCustomer[0].provider !== 'Facebook') {
              if (await findCustomer[0].provider === 'Google') {
                next(createError(406, "Please Sign in with Google"));
              }

              if (await findCustomer[0].provider === 'Apple') {
                next(createError(406, "Please Sign in with Apple"));
              }

              if (await findCustomer[0].provider === 'Local') {
                next(createError(406, "Please Sign in with Email & Password"));
              }
            }
          }
        }
      } catch (error) {
        next(error);
      }
    }

    //Apple
    if (await req.body.provider === 'Apple') {
      try {
        if (await req.body.email != null) {
          const findCustomer = await knex(customer).where("email", await req.body.email.toLowerCase()).whereNot({ provider: 'Apple', provider_id: await req.body.provider_id }).returning('*');

          if (await findCustomer.length === 0) {

            const alreadyExists = await knex(customer).where({ provider: 'Apple', email: await req.body.email.toLowerCase().trim(), provider_id: await req.body.provider_id }).returning('*');

            if (alreadyExists.length === 0) {

              let pwdChars = "0123456789ABC&DEF+#GHIJKLM!NöOPQRST-Uü?$VWXYZabc_defghijklmnopqärstuvwxyz";
              let pwdLen = 21;
              let randPassword = Array(pwdLen).fill(pwdChars).map(function (x) { return x[Math.floor(Math.random() * x.length)] }).join('');

              const newCustomer = await knex(customer).insert({
                email: req.body.email.toLowerCase().trim(),
                password: await bcrypt.hash(randPassword, hashNumber),
                provider: 'Apple',
                provider_id: req.body.provider_id,
              }).returning('*');
              if (newCustomer.length == 0) {
                next(createError(400, "Sign Up failed!"));

              } else {
                res.json({
                  customer: await newCustomer[0],
                  token: token.generate(await newCustomer[0], tokenDuration),
                  refreshToken: refreshToken.generate(await newCustomer[0], refreshTokenDuration)
                });
              }

            } else {
              if (!alreadyExists[0].is_deleted) {
                if (!alreadyExists[0].is_banned) {

                  res.json({
                    token: token.generate(await alreadyExists[0], tokenDuration),
                    refreshToken: refreshToken.generate(await alreadyExists[0], refreshTokenDuration),
                    customer: await alreadyExists[0],
                  });

                } else {
                  next(createError(401, 'Your account is banned!'));
                }
              } else {
                if (!alreadyExists[0].is_banned) {
                  const id = await alreadyExists[0].id;

                  try {
                    const newCustomer = await knex(customer).update({
                      is_active: true,
                      is_deleted: false,
                    }).where({ id: id }).returning('*');

                    if (await newCustomer.length === 0) {
                      next(createError(400, "Login failed."));
                    } else {
                      try {
                        await knex(favoriteCategorys).update({ is_deleted: false }).where({ customer_id: id });
                      } catch (err) {
                        next(err);
                      }
                      try {
                        await knex(favoriteAdvertiser).update({ is_deleted: false }).where({ customer_id: id });
                      } catch (err) {
                        next(err);
                      }
                      try {
                        await knex(favoriteAddresses).update({ is_deleted: false }).where({ customer_id: id });
                      } catch (err) {
                        next(err);
                      }
                      res.json({
                        token: token.generate(await newCustomer[0], tokenDuration),
                        refreshToken: refreshToken.generate(await newCustomer[0], refreshTokenDuration),
                        customer: await newCustomer[0],
                      });
                    }
                  } catch (error) {
                    next(error);
                  }
                } else {
                  next(createError(401, 'Your account is banned!'));
                }
              }
            }
          } else {
            if (await findCustomer[0].provider !== 'Apple') {
              if (await findCustomer[0].provider === 'Google') {
                next(createError(406, "Please Sign in with Google"));
              }

              if (await findCustomer[0].provider === 'Facebook') {
                next(createError(406, "Please Sign in with Facebook"));
              }

              if (await findCustomer[0].provider === 'Local') {
                next(createError(406, "Please Sign in with Email & Password"));
              }
            }

          }
        }
      } catch (error) {
        next(error);
      }
    }

    //Local
    if (await req.body.provider === 'Local') {
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
          next(createError(406, "Not a valid E-Mail."));
        }
        if (!isStrongPassword) {

          next(createError(406, "Min. Length of Password: 6"));
        }
      } else {

        try {
          const findCustomer = await knex(customer).where({ email: await req.body.email.toLowerCase().trim() }).returning('*');

          if (await findCustomer.length === 0) {

            try {
              const newCustomer = await knex(customer).insert({
                ...req.body,
                password: await bcrypt.hash(req.body.password, hashNumber)
              }).returning('*');


              if (await newCustomer.length === 0) {
                next(createError(400, "Sign Up failed!"));
              } else {
                const jwtInfos = {
                  id: await newCustomer[0].id,
                  email: req.body.email
                };

                const jwtToken = jwt.sign(jwtInfos, process.env.CONFIRM_MAIL_SECRET, { expiresIn: "365d" });

                const url = process.env.WEB_SITE_URL + 'verify?id=' + jwtToken;

                try {
                  let transporter = nodemailer.createTransport({
                    host: process.env.MAIL_SERVICE,
                    auth: {
                      user: process.env.MAIL_USER,
                      pass: process.env.MAIL_PW
                    }
                  });
                  transporter.sendMail({
                    from: 'NowNow - No Reply! <no_reply@nownow.de>',
                    to: req.body.email,
                    subject: "Bestätige deine E-Mail Adresse",
                    html: confirmEmailTemplate(url)
                  }, (err, info) => {
                    if (err) {
                      console.log(err);
                    }
                    console.log("************gönderildi");

                    transporter.close();
                  });
                } catch (err) {
                  next(err);
                }

                res.json({
                  customer: await newCustomer[0],
                  token: token.generate(await newCustomer[0], tokenDuration),
                  refreshToken: refreshToken.generate(await newCustomer[0], refreshTokenDuration)
                });

              }
            } catch (error) {
              next(error);
            }
          } else {
            if (await findCustomer[0].provider !== 'Local') {
              if (await findCustomer[0].provider === 'Google') {
                next(createError(406, "Please Sign in with Google"));
              }

              if (await findCustomer[0].provider === 'Facebook') {
                next(createError(406, "Please Sign in with Facebook"));
              }

              if (await findCustomer[0].provider === 'Apple') {
                next(createError(406, "Please Sign in with Apple"));
              }
            } else {
              next(createError(406, "Account exists. Please Sign in with E-Mail & Password"));
            }
          }
        } catch (error) {
          next(error);
        }
      }
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const signInCustomer = async (req, res, next) => {
  const permission = await req.headers.permission;
  if (permission === process.env.PERMISSION_KEY_CUSTOMER) {
    const isEmail = validator.isEmail(req.body.email);

    if (!isEmail) {
      next(createError(406, "Not a valid E-Mail."));
    } else {


      try {
        const findCustomer = await knex(customer)
          .where({ email: await req.body.email.toLowerCase().trim() }).returning('*');

        if (findCustomer.length === 0) {
          next(createError(406, "Wrong e-mail or password."));
        } else {

          const alreadyExists = await knex(customer)
            .where({ email: await req.body.email.toLowerCase().trim() }).whereNot({ provider: 'Local' }).returning('*');

          if (await alreadyExists.length === 0) {

            if (await !findCustomer[0].is_deleted) {
              if (!findCustomer[0].is_banned) {
                const validPassword = await bcrypt.compare(req.body.password, findCustomer[0].password);

                if (!validPassword) {
                  next(createError(406, "Wrong e-mail or password."));
                } else {
                  res.json({
                    token: token.generate(findCustomer[0], tokenDuration),
                    refreshToken: refreshToken.generate(findCustomer[0], refreshTokenDuration),
                    customer: findCustomer[0]
                  });
                }
              } else {
                next(createError(401, 'Your account is banned!'));
              }
            } else {
              if (!findCustomer[0].is_banned) {
                const id = await findCustomer[0].id;

                try {
                  const newCustomer = await knex(customer).update({
                    is_active: true,
                    is_deleted: false,
                  }).where({ id: id }).returning('*');


                  if (await newCustomer.length === 0) {
                    next(createError(400, "Login failed."));
                  } else {
                    try {
                      await knex(favoriteCategorys).update({ is_deleted: false }).where({ customer_id: id });
                    } catch (err) {
                      next(err);
                    }
                    try {
                      await knex(favoriteAdvertiser).update({ is_deleted: false }).where({ customer_id: id });
                    } catch (err) {
                      next(err);
                    }
                    try {
                      await knex(favoriteAddresses).update({ is_deleted: false }).where({ customer_id: id });
                    } catch (err) {
                      next(err);
                    }
                    const validPassword = await bcrypt.compare(req.body.password, await newCustomer[0].password);

                    if (!validPassword) {
                      throw new Error('Wrong e-mail or password.');
                    } else {
                      res.json({
                        token: token.generate(await newCustomer[0], tokenDuration),
                        refreshToken: refreshToken.generate(await newCustomer[0], refreshTokenDuration),
                        customer: await newCustomer[0],
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
          } else {
            if (await findCustomer[0].provider !== 'Local') {
              if (await findCustomer[0].provider === 'Google') {
                next(createError(406, "Please Sign in with Google"));
              }

              if (await findCustomer[0].provider === 'Facebook') {
                next(createError(406, "Please Sign in with Facebook"));
              }

              if (await findCustomer[0].provider === 'Apple') {
                next(createError(406, "Please Sign in with Apple"));
              }
            }
          }
        }
      } catch (e) {
        next(e);
      }
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const deleteCustomer = async (req, res, next) => {
  const id = await getUserId(req);
  const permission = await req.headers.permission;

  if (permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
    if (id == null) {
      next(createError(401, 'Permission denied!'));
    } else {
      try {
        const findInWorkers = await knex(worker).where({ id }).returning('*');

        const findInCustomers = await knex(customer).where({ id: req.params.identifier }).returning('*');

        if (findInWorkers.length === 0) {
          next(createError(401, 'Permission denied!'));
        } else {
          if (findInCustomers.length === 0) {
            next(createError(44, 'Not found!'));
          } else {
            try {
              await knex(customer).del().where({ id: req.params.identifier });
            } catch (error) {
              next(error);
            }

            res.json(findInCustomers[0]);
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

const updateCustomerWithoutPassword = async (req, res, next) => {
  const id = await getUserId(req);
  const permission = await req.headers.permission;

  if (permission === process.env.PERMISSION_KEY_CUSTOMER) {
    if (id == null) {
      next(createError(401, 'Permission denied!'));
    } else {

      try {
        const findInCustomers = await knex(customer).where({ id: id }).returning('id');


        if (findInCustomers.length === 0) {
          next(createError(401, 'Permission denied!'));
        } else {

          try {
            const updatedCostumer = await knex(customer).where({ id: id }).update({ ...req.body, last_update_from_user_id: id }).returning('*');


            if (await updatedCostumer.length === 0) {
              next(createError(400, 'Update customer error!'));
            } else {
              const customer_id = updatedCostumer[0].id
              if (!updatedCostumer[0].is_active) {
                try {
                  await knex(favoriteCategorys).update({ is_deleted: true, last_update_from_user_id: id }).where({ customer_id: customer_id });
                } catch (error) {
                  next(error);
                }
                try {
                  await knex(favoriteAddresses).update({ is_deleted: true, last_update_from_user_id: id }).where({ customer_id: customer_id });
                } catch (error) {
                  next(error);
                }
                try {
                  await knex(favoriteAdvertiser).update({ is_deleted: true, last_update_from_user_id: id }).where({ customer_id: customer_id });
                } catch (error) {
                  next(error);
                }
                try {
                  await knex(wallet).update({ is_deleted_customer: true, last_update_from_user_id: id }).where({ customer_id: customer_id });
                } catch (error) {
                  next(error);
                }
              }

              res.json({
                customer: await updatedCostumer[0],
                token: token.generate(await updatedCostumer[0], tokenDuration),
                refreshToken: refreshToken.generate(await updatedCostumer[0], refreshTokenDuration)
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

const updatePasswordCustomer = async (req, res, next) => {
  const id = await getUserId(req);
  const permission = await req.headers.permission;

  if (permission === process.env.PERMISSION_KEY_CUSTOMER) {
    if (id == null) {
      next(createError(401, 'Permission denied!'));
    } else {
      try {
        const findInCustomers = await knex(customer).where({ id: id }).returning('id');

        if (findInCustomers.length === 0) {
          next(createError(401, 'Permission denied!'));
        } else {

          try {
            const updateThePasswordCustomer = await knex(customer).where({ id: id }).update({
              password: await bcrypt.hash(req.body.password, hashNumber),
              last_update_from_user_id: id
            }).returning('*');


            if (updateThePasswordCustomer.length === 0) {
              next(createError(400, 'Update Password Failed!'));
            } else {
              res.json({
                token: token.generate(updateThePasswordCustomer[0], tokenDuration),
                refreshToken: refreshToken.generate(updateThePasswordCustomer[0], refreshTokenDuration),
                customer: updateThePasswordCustomer[0]
              });
            }
          } catch (error) {

            next(error);
          }
        }
      } catch (error) {
        next(createError(404, 'Not found!'));
      }
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const updateCustomerWithoutPasswordInPanel = async (req, res, next) => {
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
          const customer_id = req.body.id;

          try {
            const updatedCustomer = await knex(customer).where({ id: customer_id }).update({ ...req.body }).returning('*');


            if (updatedCustomer.length === 0) {

              next(createError(400, 'Update Customer Error!'));
            } else {
              if (!updatedCustomer[0].is_active) {
                try {
                  await knex(favoriteCategorys).update({ is_deleted: true }).where({ customer_id: customer_id });
                } catch (error) {
                  next(error);
                }
                try {
                  await knex(favoriteAddresses).update({ is_deleted: true }).where({ customer_id: customer_id });
                } catch (error) {
                  next(error);
                }
                try {
                  await knex(favoriteAdvertiser).update({ is_deleted: true }).where({ customer_id: customer_id });
                } catch (error) {
                  next(error);
                }
                try {
                  await knex(wallet).update({ is_deleted_customer: true }).where({ customer_id: customer_id });
                } catch (error) {
                  next(error);
                }
              }
              res.json(updatedCustomer[0]);
            }
          } catch (error) {

            next(createError(400, 'Update Customer Error'));
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

const updateCustomerPassword = async (req, res, next) => {
  try {

    const tkn = req.params.token.trim();
    const id = req.params.id.trim();



    if (tkn && id) {
      let findCustomer;
      try {
        findCustomer = await await knex("Customer").where({ id: id }).returning('*');
      } catch (error) {
        next(error);
      }


      if (findCustomer.length !== 0) {
        const secret = process.env.UPDATE_PW_CUSTOMER_SECRET + "-" + findCustomer[0].password;
        jwt.verify(tkn, secret, async (e, decoded) => {
          if (e) {
            res.redirect('/tokeninvalid');
          } else {

            res.render('../views/forget_password_customer.ejs', { id: id, token: tkn, layout: '../views/layout/password_layout.ejs' });

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

const saveCustomerPassword = async (req, res, next) => {
  const validationErrors = validationResult(req);


  if (!validationErrors.isEmpty()) {


    req.flash('validation_error', validationErrors.array());
    req.flash('password', req.body.password);
    req.flash('repeatPassword', req.body.repeatPassword);

    res.redirect('/updatePwCustomer/' + req.body.id.trim() + '/' + req.body.token.trim());

  } else {
    try {
      let findCustomer;
      try {
        findCustomer = await knex("Customer").where({ id: req.body.id.trim() }).returning('*');
      } catch (error) {
        next(error);
      }

      if (findCustomer.length !== 0) {
        const hashedPassword = await bcrypt.hash(req.body.password, hashNumber);
        let resultCustomer;
        try {
          resultCustomer = knex("Customer").where({ id: req.body.id.trim() }).update({
            password: hashedPassword
          }).returning('*');
        } catch (error) {
          next(error);
        }


        if (resultCustomer.length !== 0) {
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

const findStadsAndQroffers = async (req, res, next) => {
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
            const findedStads = await knex.raw(`
            SELECT DISTINCT public."STAD".*, 
ST_DistanceSphere(ST_MakePoint(${await updatedCustomer[0].longitude},${await updatedCustomer[0].latitude}), ST_MakePoint(public."STAD".longitude,public."STAD".latitude)) AS distance
FROM public."STAD"
INNER JOIN public."STAD_Subsubcategory" on public."STAD".id = public."STAD_Subsubcategory".stad_id
INNER JOIN public."Favorite_Categorys_Customer" on public."Favorite_Categorys_Customer".customer_id = '${await updatedCustomer[0].id}'
WHERE (public."Favorite_Categorys_Customer".subsubcategory_id = public."STAD_Subsubcategory".subsubcategory_id)
AND (public."STAD".is_active = true) 
AND (ST_DistanceSphere(ST_MakePoint(${await updatedCustomer[0].longitude},${await updatedCustomer[0].latitude}), ST_MakePoint(public."STAD".longitude,public."STAD".latitude)) <= public."STAD".display_radius)
ORDER BY distance`);

            const findedQroffers = await knex.raw(`
SELECT DISTINCT public."QROFFER".*, 
ST_DistanceSphere(ST_MakePoint(${await updatedCustomer[0].longitude},${await updatedCustomer[0].latitude}), ST_MakePoint(public."QROFFER".longitude,public."QROFFER".latitude)) AS distance
FROM public."QROFFER"
INNER JOIN public."QROFFER_Subsubcategory" on public."QROFFER".id = public."QROFFER_Subsubcategory".qroffer_id
INNER JOIN public."Favorite_Categorys_Customer" on public."Favorite_Categorys_Customer".customer_id = '${await updatedCustomer[0].id}'
WHERE (public."Favorite_Categorys_Customer".subsubcategory_id = public."QROFFER_Subsubcategory".subsubcategory_id)
AND (public."QROFFER".is_active = true) 
AND (ST_DistanceSphere(ST_MakePoint(${await updatedCustomer[0].longitude},${await updatedCustomer[0].latitude}), ST_MakePoint(public."QROFFER".longitude,public."QROFFER".latitude)) <= public."QROFFER".display_radius)
ORDER BY distance`);


            const findAddressesWithActiveStads = await knex.raw(`SELECT DISTINCT public."Address".id
FROM public."STAD"
INNER JOIN public."STAD_Subsubcategory" on public."STAD".id = public."STAD_Subsubcategory".stad_id
INNER JOIN public."Favorite_Categorys_Customer" on public."Favorite_Categorys_Customer".customer_id = '${await updatedCustomer[0].id}'
INNER JOIN public."Address" on public."Address".id = public."STAD".address_id
WHERE (public."Favorite_Categorys_Customer".subsubcategory_id = public."STAD_Subsubcategory".subsubcategory_id)
AND (public."STAD".is_active = true) 
AND (ST_DistanceSphere(ST_MakePoint(${await updatedCustomer[0].longitude},${await updatedCustomer[0].latitude}), ST_MakePoint(public."STAD".longitude,public."STAD".latitude)) <= public."STAD".display_radius)`);


            const findAddressesWithActiveQroffers = await knex.raw(`

            SELECT DISTINCT public."Address".id
            FROM public."QROFFER"
            INNER JOIN public."QROFFER_Subsubcategory" on public."QROFFER".id = public."QROFFER_Subsubcategory".qroffer_id
            INNER JOIN public."Favorite_Categorys_Customer" on public."Favorite_Categorys_Customer".customer_id = '${await updatedCustomer[0].id}'
            INNER JOIN public."Address" on public."Address".id = public."QROFFER".address_id
            WHERE (public."Favorite_Categorys_Customer".subsubcategory_id = public."QROFFER_Subsubcategory".subsubcategory_id)
            AND (public."QROFFER".is_active = true) 
            AND (ST_DistanceSphere(ST_MakePoint(${await updatedCustomer[0].longitude},${await updatedCustomer[0].latitude}), ST_MakePoint(public."QROFFER".longitude,public."QROFFER".latitude)) <= public."QROFFER".display_radius)`);


            const addressList = findAddressesWithActiveQroffers.rows.concat(findAddressesWithActiveStads.rows);


            let list = [];

            addressList.map(adrs => list.push(adrs.id));

            const addressUniqueList = [...new Set(list)];

            const mappedUniqueList = addressUniqueList.map(adrs =>
              ({ id: adrs }));

            await res.json({
              "stads": await findedStads.rows,
              "qroffers": await findedQroffers.rows,
              "addresses": mappedUniqueList,
            })
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
  getAllCustomer,
  findMe,
  findCustomerPanel,
  findCustomersEmail,
  resetCustomerPassword,
  createCustomer,
  signInCustomer,
  deleteCustomer,
  updateCustomerWithoutPassword,
  updatePasswordCustomer,
  updateCustomerWithoutPasswordInPanel,
  verifyEmail,
  updateCustomerPassword,
  saveCustomerPassword,
  passwordSaved,
  tokenInvalid,
  emailActivated,
  passwordSaveError,
  findStadsAndQroffers,
}