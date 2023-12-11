const router = require('express').Router();
const controller = require('../controllers/advertiserController');

router.get('/', controller.getAllAdvertiser);

router.get('/me', controller.findMe);

router.get('/inPanel/:identifier', controller.findAdvertiserPanel);

router.post('/email', controller.findAdvertisersEmail);

router.post('/resetPassword', controller.resetAdvertiserPassword);

router.post('/createAdvertiser', controller.createAdvertiser);

router.post('/signInAdvertiser', controller.signInAdvertiser);

router.delete('/destroyAdvertiser', controller.deleteAdvertiser);

router.delete('/destroyAdvertiserSelf', controller.deleteAdvertiserSelf);

router.patch('/updateAdvertiser', controller.updateAdvertiser);

router.patch('/updatePw', controller.updatePasswordAdvertiser);

router.patch('/updateWithoutPwInPanel', controller.updateAdvertiserWithoutPasswordInPanel);


module.exports = router;