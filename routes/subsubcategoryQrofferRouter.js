const router = require('express').Router();
const controller = require('../controllers/subsubcategoryQrofferController');

router.get('/subsubcategory', controller.getSubsubcategory);

router.get('/qroffer', controller.getQroffer);

router.get('/qrofferssubsub/:identifier', controller.getSubSubcategoryQroffer);

module.exports = router;