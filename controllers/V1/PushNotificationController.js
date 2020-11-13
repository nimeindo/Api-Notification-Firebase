const env = require("dotenv");
env.config()
const promise = require('request-promise');
const firebaseAdmin = require('firebase-admin')
const customJwt = process.env.CUSTOM_JWT_FIREBASE

const privateKeyFilename = process.env.FCM_PRIVATE_KEY_FILENAME
const fcmDatabaseUrl = process.env.FCM_DATABASE_URL
const FCMModel = require('../../models/FcmModels')

const RedisConfig = require('../../config/RedisConfig')
const redisPassword = process.env.REDIS_PWD
const redisHost = process.env.REDIS_HOST
const redisDatabase = process.env.REDIS_DATABASE
const redisPort = process.env.REDIS_PORT

let client

RedisConfig.init(redisHost, redisDatabase, redisPassword, redisPort, function(redisClient, error, message) {
  if(error)
    console.error("FAILED to initialize Redis :" + message)
  else
    console.log('SUCCES Redis initialized')

    client = redisClient
})

var serviceAccount = require("../../credentials/" + privateKeyFilename + ".json")

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: fcmDatabaseUrl
})
console.log(serviceAccount.client_email)
const messaging = firebaseAdmin.messaging()

module.exports = {
    Subscribe : async function(req, res, next){
        try {
            let _result = {}
            _result.return = false
            _result.message = 'Invalid parameters'
            _result.response = []
        
            if (req.headers.authorization && req.headers.authorization !== customJwt) {
                _result.message = 'Forbidden'
        
                return res.json(_result)
            }
        
            if (!req.body.token || req.body.token === '') {
                _result.message = 'Token is required'
        
                return res.json(_result)
            }
        
            const registrationToken = req.body.token
            const topic = req.body.topic ? req.body.topic : 'all'
            const params = [
                registrationToken
            ]
        
            messaging.subscribeToTopic(params, topic)
                .then((response) => {
                  if(response.failureCount == 0) {
                    _result.return = true
                    _result.message = 'Success'
                    _result.response = response
                    _result.topic = topic
        
                    //increase subscriber number
                    FCMModel.updateTotalSubscriber(topic, client, function(error, total) {
                      console.log("total_subscriber:" + total)
                      return res.json(_result)
                    })
                  } else {
                    return res.json(response)
                  }
                })
                .catch((err) => {
                    console.log("Result ERROR " + err)
                    _result.message = 'Failure'
                    // _result.message = 'Failure, ' + saveData.message
                    _result.error = err
        
                    return res.json(_result)
                })
            // }
        }catch(err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    },
    UnSubscribe : async function(req, res, next){
      try {
        let _result = {}
        _result.return = false
        _result.message = 'Invalid parameters'
        _result.response = []
        _result.error = []
    
        if (req.headers.authorization && req.headers.authorization !== customJwt) {
            _result.message = 'Forbidden'
    
            return res.json(_result)
        }
    
        if (!req.body.token || req.body.token === '') {
            _result.message = 'Token is required'
    
            return res.json(_result)
        }
    
        const registrationToken = req.body.token
        const topic = req.body.topic ? req.body.topic : 'all'
        const params = [
            registrationToken
        ]
    
        // const userData = {}
        // const saveData = await _unsubscribe(params, topic, userData)
    
        // if (!saveData.return) {
        //     _result.message = 'Error save to database, ' + saveData.message
        //     return res.json(_result)
        // }
    
        // if (saveData.return) {
        messaging.unsubscribeFromTopic(params, topic)
            .then((response) => {
                _result.return = true
                _result.message = 'Success'
                // _result.message = 'Success, ' + saveData.message
                _result.response = response
    
                return res.json(_result)
            })
            .catch((err) => {
                _result.message = 'Failure'
                // _result.message = 'Failure, ' + saveData.message
                _result.error = err
    
                return res.json(_result)
            })
        // }
      }catch(err) {
          console.error(err.message);
          res.status(500).send("Server Error");
      }
    },
    TotalSubscribe : async function(req, res, next){
      try {
        let _result = {}
        _result.return = false
        _result.message = 'Invalid parameters'
        _result.response = {}

        if (req.headers.authorization && req.headers.authorization !== customJwt) {
            _result.message = 'Forbidden'

            return res.json(_result)
        }

        const topic = req.body.topic ? req.body.topic : 'all'

        FCMModel.getTotalSubscriber(topic, client, function(error, data) {
          if(!error) {
            _result.return = true
            _result.message = "SUCCES"
            _result.response.total = data
            _result.response.topic = topic
          } else {
            _result.return = false
            _result.message = "FAILED"
            _result.response.topic = topic
          }

          return res.json(_result)
        })
      }catch(err) {
          console.error(err.message);
          res.status(500).send("Server Error");
      }
    },
    SendNotification : async function(req, res, next){
      try {
        let _result = {}
        _result.return = false
        _result.message = 'Invalid parameters'
        _result.response = []
        _result.error = []

        if (req.headers.authorization && req.headers.authorization !== 'Bearer ' + customJwt) {
            _result.message = 'Forbidden'

            return res.json(_result)
        }

        const title = req.body.title ? req.body.title : defaultTitle
        const body = req.body.body ? req.body.body : defaultBody
        const icon = req.body.icon ? req.body.icon : defaultIconUrl
        const actionClick = req.body.action_click ? req.body.action_click : defaultActionClick

        const template = {
            data: {
                title: title,
                body: body,
                icon: icon,
                action_click: actionClick
            }
        }

        if (req.body.token) {
            template.token = req.body.token
        }
        if (req.body.topic || !req.body.token) {
            template.topic = req.body.topic ? req.body.topic : 'all'
        }

        messaging.send(template)
            .then((response) => {
                // console.log('succes', response)
                _result.return = true
                _result.message = 'Success'
                _result.response = response

                return res.json(_result)
            })
            .catch((err) => {
                // console.log('ERROR CUY', err)
                _result.message = 'Failure'
                _result.error = err

                return res.json(_result)
            })
      }catch(err) {
          console.error(err.message);
          res.status(500).send("Server Error");
      }
    }
}