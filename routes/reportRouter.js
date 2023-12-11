const router = require('express').Router();
const controller = require('../controllers/reportController');

router.get('/', controller.getAllReports);

router.get('/advertiser/:identifier', controller.reportsFromAdvertiser);

router.post('/createReport', controller.createReport);

router.patch('/updateReport', controller.updateReport);


module.exports = router;