const router = require('express').Router();
const controller = require('../controllers/invoiceAddressController');

router.get('/', controller.getAllInvoiceAddresses);

router.get('/myInvoiceAddresses', controller.getAllMyInvoiceAddresses);

router.get('/my/:identifier', controller.myInvoiceAddress);

router.post('/createInvoiceAddress', controller.createInvoiceAddress);

router.post('/createInvoiceAddressInPanel', controller.createInvoiceAddressInPanel);

router.patch('/updateInvoiceAddress', controller.updateInvoiceAddress);

router.patch('/updateInvoiceAddressInPanel', controller.updateInvoiceAddressInPanel);


module.exports = router;