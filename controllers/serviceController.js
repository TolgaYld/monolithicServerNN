const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const knex = require('../db/db');
const createError = require('http-errors');
const { token, refreshToken } = require('../helpers/token');


const customer = "Customer";
const advertiser = "Advertiser";




const tokenService = async (req, res, next) => {
    const tokenDuration = '3h';
    const refreshTokenDuration = '90d';
    const refresh = await req.headers.refresh;
    const header = await req.headers.authorization;
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        if (refresh != null && header != null) {
            let id;

            try {
                const tkn = await header.split(' ')[1];    //split or u can use replace('Bearer', '')
                const decodedToken = await jwt.verify(tkn, process.env.SECRET_KEY);
                id = decodedToken.id;

                try {
                    const findCustomer = await knex(customer).where({ id: id }).returning('id');

                    const findAdvertiser = await knex(advertiser).where({ id: id }).returning('id');


                    if (findCustomer.length === 0 && findAdvertiser.length === 0) {
                        next(createError(401, 'Permission denied!'));
                    } else {

                        if (findCustomer.length !== 0) {

                            await res.json({
                                token: token.generate(await findCustomer[0], tokenDuration),
                                refreshToken: refreshToken.generate(await findCustomer[0], refreshTokenDuration)
                            });
                        } else {
                            await res.json({
                                token: token.generate(await findAdvertiser[0], tokenDuration),
                                refreshToken: refreshToken.generate(await findAdvertiser[0], refreshTokenDuration)
                            });
                        }
                    }
                } catch (error) {

                    next(createError(401, 'Permission denied!'));
                }
            } catch (e) {

                if (Error(e).message == "TokenExpiredError: jwt expired") {

                    try {
                        const reftoken = await refresh.split(' ')[1];    //split or u can use replace('Bearer', '')
                        const decoded = await jwt.verify(reftoken, process.env.SECRET_KEY_REFRESH);

                        id = await decoded.id;

                        try {
                            const findCustomer = await knex(customer).where({ id: id }).returning('id');

                            const findAdvertiser = await knex(advertiser).where({ id: id }).returning('id');


                            if (findCustomer.length === 0 && findAdvertiser.length === 0) {
                                next(createError(401, 'Permission denied!'));
                            } else {

                                if (findCustomer.length !== 0) {

                                    await res.json({
                                        token: token.generate(await findCustomer[0], tokenDuration),
                                        refreshToken: refreshToken.generate(await findCustomer[0], refreshTokenDuration)
                                    });
                                } else {
                                    await res.json({
                                        token: token.generate(await findAdvertiser[0], tokenDuration),
                                        refreshToken: refreshToken.generate(await findAdvertiser[0], refreshTokenDuration)
                                    });
                                }
                            }
                        } catch (error) {

                            next(createError(401, 'Permission denied!'));
                        }
                    } catch (error) {
                        next(createError(401, 'Permission denied!'));
                    }
                } else {
                    next(createError(401, 'Permission denied!'));
                }
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


                    try {
                        findAdvertiser = await knex(advertiser).where({ id: idInToken.toString() }).returning('*');
                    } catch (error) {
                        next(error);
                    }


                    if (findAdvertiser.length !== 0) {
                        let updatedAdvertiser;

                        try {
                            updatedAdvertiser = await knex(advertiser).where({ id: idInToken }).update({
                                email_confirmed: true
                            }).returning('*');
                        } catch (error) {
                            console.log(error);
                            next(error);
                        }


                        if (updatedAdvertiser.length !== 0) {
                            res.redirect('/emailActivated');
                        } else {
                            res.redirect('/tokeninvalid');
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
                findAdvertiser = await knex(advertiser).where({ id: id }).returning('*');
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
                findAdvertiser = await knex(advertiser).where({ id: req.body.id.trim() }).returning('*');
            } catch (error) {
                next(error);
            }

            if (findAdvertiser.length !== 0) {
                const hashedPassword = await bcrypt.hash(req.body.password, 15);
                let resultAdvertiser;
                try {
                    resultAdvertiser = await await knex(advertiser).where({ id: req.body.id.trim() }).update({
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

const updateCustomerPassword = async (req, res, next) => {
    try {

        const tkn = req.params.token.trim();
        const id = req.params.id.trim();



        if (tkn && id) {
            let findCustomer;
            try {
                findCustomer = await await knex(customer).where({ id: id }).returning('*');
            } catch (error) {
                next(error);
            }


            if (findCustomer.length !== 0) {
                const secret = process.env.UPDATE_PW_CUSTOMER_SECRET + "-" + findCustomer[0].password;
                jwt.verify(token, secret, async (e, decoded) => {
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
                findCustomer = await knex(customer).where({ id: req.body.id.trim() }).returning('*');
            } catch (error) {
                next(error);
            }

            if (findCustomer.length !== 0) {
                const hashedPassword = await bcrypt.hash(req.body.password, 15);
                let resultCustomer;
                try {
                    resultCustomer = await knex(customer).where({ id: req.body.id.trim() }).update({
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




module.exports = {
    tokenService,
    updateAdvertiserPassword,
    updateCustomerPassword,
    saveCustomerPassword,
    verifyEmail,
    passwordSaved,
    tokenInvalid,
    emailActivated,
    saveAdvertiserPassword,
    passwordSaveError,
};