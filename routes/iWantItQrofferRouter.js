const router = require('express').Router();
const controller = require('../controllers/iWantItQrofferController');

router.get('/all/:identifier', controller.getAllIwantItsForOneQroffer);

router.get('/all', controller.getAllIwantIts);

router.get('/me/:identifier', controller.iWantItQrofferMe);

router.post('/createAndDelete', controller.createAndDeleteIWantItQroffer);



module.exports = router;