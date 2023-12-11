const router = require('express').Router();
const controller = require('../controllers/walletController');

router.get('/myWalletCustomer', controller.getMyWalletCustotmer);

router.get('/myWalletAdvertiser', controller.getMyWalletAdvertiser);

router.patch('/transferWallet', controller.walletToOtherCustomer);

router.delete('/deleteWallet', controller.deleteWalletFromCustomer);

router.patch('/redeem', controller.redeemQroffer);



module.exports = router;