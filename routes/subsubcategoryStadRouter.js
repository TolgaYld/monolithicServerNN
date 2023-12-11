const router = require('express').Router();
const controller = require('../controllers/subsubcategoryStadController');

router.get('/subsubcategory', controller.getSubsubcategory);

router.get('/stad', controller.getStad);

router.get('/stadsubsub/:identifier', controller.getSubSubcategoryStad);



module.exports = router;