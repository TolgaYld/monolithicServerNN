const router = require('express').Router();
const controller = require('../controllers/coldCallController');

router.get('/', controller.getAllColdCalls);

router.get('/:identifier', controller.getColdCall);

router.patch('/:identifier', controller.updateColdCall);

router.post('/createCategory', controller.createColdCall);



module.exports = router;