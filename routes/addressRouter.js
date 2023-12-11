const router = require('express').Router();
const controller = require('../controllers/addressController');

router.get('/', controller.getAllAddresses);

router.get('/myActiveAddresses', controller.myActiveAddresses);

router.get('/myAddresses', controller.myAddresses);

router.get('/inPanel/:identifier', controller.myAddress);

router.get('/activeStadQroffer', controller.addressesWithActiveStadsOrQroffer);

router.post('/createAddress', controller.createAddress);

router.post('/createAddressInPanel', controller.createAddressInPanel);

router.patch('/updateAddress', controller.updateAddress);

router.patch('/fetchAddressesForCustomer', controller.findAddressesForCustomer);

router.patch('/updateAddressInPanel', controller.updateAddressInPanel);

router.patch('/updateQrofferShortDescription', controller.updateQrofferShortDescription);

router.patch('/updateQrofferShortDescriptionInPanel', controller.updateQrofferShortDescriptionInPanel);

router.delete('/destroyAddress', controller.deleteAddress);

router.delete('/destroyAddressFromDb/:identifier', controller.deleteAddressFromDb);


module.exports = router;