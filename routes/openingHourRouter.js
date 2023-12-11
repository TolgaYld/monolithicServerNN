const router = require('express').Router();
const controller = require('../controllers/openingHourController');

router.get('/OpeningHourForAddress/:identifier', controller.getOpeningHoursForAddress);

router.get('/my', controller.getOpeningHours);

router.post('/createOpeningHour', controller.createOpeningHour);

router.post('/createOpeningHourInPanel', controller.createOpeningHourInPanel);

router.delete('/deleteOpeningHour', controller.deleteOpeningHour);

router.delete('/deleteOpeningHourInPanel', controller.deleteOpeningHourInPanel);



module.exports = router;