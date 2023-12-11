const router = require('express').Router();
const controller = require('../controllers/iWantItStadController');

router.get('/all/:identifier', controller.getAllIwantItsForOneStad);

router.get('/all', controller.getAllIwantIts);

router.get('/me/:identifier', controller.iWantItStadMe);

router.post('/createAndDelete', controller.createAndDeleteIWantItStad);



module.exports = router;