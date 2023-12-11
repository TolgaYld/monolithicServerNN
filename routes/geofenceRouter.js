const router = require('express').Router();
const controller = require('../controllers/geoefenceController');

router.get('/', controller.getAllGeofences);

router.get('/:identifier', controller.findOneGeofence);

router.delete('/:identifier', controller.deleteOneGeofence);

router.patch('/:identifier', controller.updateOneGeofence);

router.post('/geofence', controller.createGeofence);


module.exports = router;