const router = require('express').Router();
const controller = require('../controllers/favoriteAdvertiserController');

router.get('/', controller.getAllFavoriteAdvertiser);

router.post('/createAndDeleteFavoriteAdvertiser', controller.createAndDeleteFavoriteAdvertiser);



module.exports = router;