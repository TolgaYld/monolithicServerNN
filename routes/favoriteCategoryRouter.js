const router = require('express').Router();
const controller = require('../controllers/favoriteCategoryController');

router.get('/', controller.getAllFavoriteCategorys);

router.post('/createAndDeleteFavoriteCategory', controller.createAndDeleteFavoriteCategory);



module.exports = router;