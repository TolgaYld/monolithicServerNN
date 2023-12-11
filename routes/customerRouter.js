const router = require('express').Router();
const controller = require('../controllers/customerController');



router.get('/', controller.getAllCustomer);

router.get('/me', controller.findMe);

router.get('/inPanel/:identifier', controller.findCustomerPanel);

router.post('/email', controller.findCustomersEmail);

router.post('/resetPassword', controller.resetCustomerPassword);

router.post('/createCustomer', controller.createCustomer);

router.post('/signInCustomer', controller.signInCustomer);

router.delete('/destroyCustomer', controller.deleteCustomer);

router.patch('/updateWithoutPw', controller.updateCustomerWithoutPassword);

router.patch('/fetchStadsAndQroffers', controller.findStadsAndQroffers);

router.patch('/updatePw', controller.updatePasswordCustomer);

router.patch('/updateWithoutPwInPanel', controller.updateCustomerWithoutPasswordInPanel);


module.exports = router;