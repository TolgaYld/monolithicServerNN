const router = require('express').Router();
const controller = require('../controllers/categoryController');

router.get('/', controller.getAllCategorys);

router.get('getCategory/:identifier', controller.getCategory);

router.get('/getAllActive', controller.getAllActiveCategorys);

router.post('/createCategory', controller.createCategory);

router.patch('/updateCategory', controller.updateCategory);



module.exports = router;