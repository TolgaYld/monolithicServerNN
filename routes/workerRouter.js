const router = require('express').Router();
const controller = require('../controllers/workerController');



router.get('/', controller.getAllWorker);

router.get('/me', controller.findMe);

router.get('/inPanel/:identifier', controller.findWorkerPanel);

router.post('/email', controller.findWorkersEmail);

router.post('/resetPassword', controller.updatePasswordWorker);

router.post('/createWorker', controller.createWorker);

router.post('/signInWorker', controller.signInWorker);

router.delete('/destroyWorker', controller.deleteWorker);

router.patch('/updateWithoutPw', controller.updateWorkerWithoutPassword);

router.patch('/updateWithoutPwInPanel', controller.updateWorkerWithoutPasswordInPanel);


module.exports = router;