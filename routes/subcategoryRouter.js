const router = require('express').Router();
const controller = require('../controllers/subcategoryController');

router.get('/', controller.getAllSubcategorys);

router.get('getSubcategory/:identifier', controller.getSubcategory);

router.get('/getAllActiveSubcategorys', controller.getAllActiveSubcategorys);

router.get('/getAllActiveFromCategory/:identifier', controller.getAllActiveSubcategorysFromCategory);

router.post('/createSubcategory', controller.createSubcategory);

router.post('/createSubcategorySuggestion', controller.createSubcategorySuggestion);

router.patch('/updateSubategory', controller.updateSubcategory);



module.exports = router;