const router = require('express').Router();
const controller = require('../controllers/qrofferController');

router.get('/getMyActiveQroffers', controller.getAllMyActiveQroffer);

router.get('/getAllMyQroffers', controller.getAllMyQroffer);

router.get('/one/:identifier', controller.oneQroffer);

router.get('/oneInactive/:identifier', controller.oneInactiveQroffer);

router.get('/all', controller.allQroffers);

router.get('/findQroffersForCustomer', controller.findQroffersForCustomer);

router.post('/createQroffer', controller.createQroffer);

router.patch('/updateQroffer', controller.updateQroffer);

router.patch('/updateQrofferInPanel', controller.updateQrofferInPanel);

router.delete('/deleteQrofferCompletely', controller.deleteQrofferCompletely);

router.delete('/deleteQroffer', controller.deleteQroffer);

router.post('/createArchive', controller.createArchiveQroffer);

router.patch('/archiveToActive', controller.archiveToActive);


module.exports = router;