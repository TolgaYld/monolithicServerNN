const router = require('express').Router();
const controller = require('../controllers/stadController');

router.get('/getMyActiveStad', controller.getMyActiveStad);

router.get('/myStads', controller.getMyStads);

router.get('/one/:identifier', controller.oneStad);

router.get('/oneInactive/:identifier', controller.oneInactiveStad);

router.get('/all', controller.allStads);

router.get('/findStadsForCustomer', controller.findStadsForCustomer);

router.post('/createStad', controller.createStad);

router.patch('/updateStad', controller.updateStad);

router.patch('/updateStadInPanel', controller.updateStadInPanel);

router.delete('/deleteStadCompletely', controller.deleteStadCompletely);

router.delete('/deleteStad', controller.deleteStad);

router.post('/createArchive', controller.createArchiveStad);

router.patch('/archiveToActive', controller.archiveToActive);


module.exports = router;