const router = require('express').Router();
const controller = require('../controllers/subsubcategoryController');

router.get('/', controller.getAllSubsubcategorys);

router.get('getSubsubcategory/:identifier', controller.getSubsubcategory);

router.get('/getAllActiveFromCategory/:identifier', controller.getAllActiveSubsubcategorysFromCategory);

router.get('/getAllActiveFromSubcategory/:identifier', controller.getAllActiveSubsubcategorysFromSubcategory);

router.get('/getAllActiveSubsubcategorys', controller.getAllActiveSubsubcategorys);

router.post('/createSubsubcategory', controller.createSubsubcategory);

router.patch('/updateSubsubategory', controller.updateSubsubcategory);




module.exports = router;