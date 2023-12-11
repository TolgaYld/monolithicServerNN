const router = require('express').Router();
const controller = require('../controllers/favoriteAddressesController');

router.get('/', controller.getAllFavoriteAddresses);

router.post('/createAndDeleteFavoriteAddresses', controller.createAndDeleteFavoriteAddresses);



module.exports = router;