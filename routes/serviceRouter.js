const router = require('express').Router();
const validatorMiddleware = require('../middleware/newPasswordMiddleware');
const controller = require('../controllers/serviceController');

// Refresh Token
router.get('/refresh', controller.tokenService);


//Verify User

router.get('/verify', controller.verifyEmail);

//Reset Passwords

//Advertiser

router.get('/updatePwAdvertiser/:id/:token', validatorMiddleware.validateNewPassword(), controller.updateAdvertiserPassword);
router.get('/updatePwAdvertiser', validatorMiddleware.validateNewPassword(), controller.updateAdvertiserPassword);
router.post('/updatePwAdvertiser', validatorMiddleware.validateNewPassword(), controller.saveAdvertiserPassword);

//Customer

router.get('/updatePwCustomer/:id/:token', validatorMiddleware.validateNewPassword(), controller.updateCustomerPassword);
router.get('/updatePwCustomer', validatorMiddleware.validateNewPassword(), controller.updateCustomerPassword);
router.post('/updatePwCustomer', validatorMiddleware.validateNewPassword(), controller.saveCustomerPassword);



router.get('/passwordsvd', controller.passwordSaved);
router.get('/tokeninvalid', controller.tokenInvalid);
router.get('/emailActivated', controller.emailActivated);
router.get('/passwordError', controller.passwordSaveError);





module.exports = router;