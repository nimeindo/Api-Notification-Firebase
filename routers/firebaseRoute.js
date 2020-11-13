const express = require('express')
const router = express.Router()
const PushNotificationController = require('../controllers/V1/PushNotificationController')

router.route('/subscribe')
    .post(PushNotificationController.Subscribe);

router.route('/unsubscribe')
    .post(PushNotificationController.UnSubscribe);

router.route('/total-subscribe')
    .post(PushNotificationController.TotalSubscribe);

router.route('/send-notification')
    .post(PushNotificationController.SendNotification);


module.exports = router;