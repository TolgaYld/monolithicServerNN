const express = require('express');
require('dotenv').config();
const session = require('express-session');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');

const cronJobEmailActivation = require('./services/email_activation_service');
const intvervallStad = require('./services/intervall_stad');
const intvervallQroffer = require('./services/intervall_qroffer');
const intervallDestroyAccounts = require('./services/intervall_destroy_accounts');
const intervallExpiryDateQroffer = require('./services/qroffer_expired_service');
const createEntriesInDb = require('./services/faker');



// Middlewares
const errorMiddleware = require('./middleware/errorMiddleware.js');



//IMPORT ROUTES

const advertiserRouter = require('./routes/advertiserRouter');
const customerRouter = require('./routes/customerRouter');
const addressRouter = require('./routes/addressRouter');
const categoryRouter = require('./routes/categoryRouter');
const geofenceRouter = require('./routes/geofenceRouter');
const favoriteAddressRouter = require('./routes/favoriteAddressesRouter');
const favoriteAdvertiserRouter = require('./routes/favoriteAdvertiserRouter');
const favoriteCategorysRouter = require('./routes/favoriteCategoryRouter');
const invoiceAddressRouter = require('./routes/invoiceAddressRouter');
const iWantItStadRouter = require('./routes/iWantItStadRouter');
const iWantItQrofferRouter = require('./routes/iWantItQrofferRouter');
const openingHourRouter = require('./routes/openingHourRouter');
const qrofferRouter = require('./routes/qrofferRouter');
const subcategoryRouter = require('./routes/subcategoryRouter');
const subsubcategoryRouter = require('./routes/subsubcategoryRouter');
const subsubcategoryQrofferRouter = require('./routes/subsubcategoryQrofferRouter');
const subsubcategoryStadRouter = require('./routes/subsubcategoryStadRouter');
const reportRouter = require('./routes/reportRouter');
const walletRouter = require('./routes/walletRouter');
const stadRouter = require('./routes/stadRouter');
const workerRouter = require('./routes/workerRouter');
const coldCallRouter = require('./routes/coldCallRouter');
const serviceRouter = require('./routes/serviceRouter');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// USE ROUTES

app.use('/api/geofence', geofenceRouter);
app.use('/api/advertiser', advertiserRouter);
app.use('/api/customer', customerRouter);
app.use('/api/address', addressRouter);
app.use('/api/favoriteAddresses', favoriteAddressRouter);
app.use('/api/favoriteAdvertisers', favoriteAdvertiserRouter);
app.use('/api/favoriteCategorys', favoriteCategorysRouter);
app.use('/api/category', categoryRouter);
app.use('/api/invoiceAddress', invoiceAddressRouter);
app.use('/api/openingHour', openingHourRouter);
app.use('/api/qroffer', qrofferRouter);
app.use('/api/stad', stadRouter);
app.use('/api/subcategory', subcategoryRouter);
app.use('/api/subsubcategory', subsubcategoryRouter);
app.use('/api/subsubcategoryQroffer', subsubcategoryQrofferRouter);
app.use('/api/subsubcategoryStad', subsubcategoryStadRouter);
app.use('/api/iWantItStad', iWantItStadRouter);
app.use('/api/report', reportRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/iWantItQroffer', iWantItQrofferRouter);
app.use('/api/worker', workerRouter);
app.use('/api/coldCall', coldCallRouter);

app.set('trust proxy', 1);
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true,
        maxAge: 10000 * 6
    }
})
);
app.use(function (req, res, next) {
    if (!req.session) {
        return next(new Error('Session error')); //handle error
    }
    next() //otherwise continue
});
app.use(flash());
app.use((req, res, next) => {
    res.locals.validation_error = req.flash('validation_error');
    res.locals.success_message = req.flash('success_message');
    res.locals.password = req.flash('password');
    res.locals.repeatPassword = req.flash('repeatPassword')
    next();
});

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));


app.use('/', serviceRouter);

//CRONJOBS AND INTERVALS
intervallDestroyAccounts.start();
cronJobEmailActivation.start;
intervallExpiryDateQroffer.start();
intvervallStad.start();
intvervallQroffer.start();
// createEntriesInDb.createEntriesInDb();

// USE MIDDLEWARE

app.use(errorMiddleware);



app.listen({ port: process.env.PORT }, () => {
    console.log("Server up!");
});
