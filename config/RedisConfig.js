const redis = require('redis')

let client

module.exports.init = (redisHost, redisDatabase, redisPassword, redisPort, callback) => {
  if (redisPassword !== 'null') {
      client = redis.createClient({
          host: redisHost,
          no_ready_check: true,
          auth_pass: redisPassword
      }) // with password
  } else {
      client = redis.createClient({
          host: redisHost,
          no_ready_check: true
      }) // without password
  }
  client.select(redisDatabase)

  client.on('connect', () => {
      console.log('Connected to Redis Hitlog (' + redisHost + ':' + redisPort + ')')
      callback(client, false, '')
  })

  client.on('error', (err) => {
      console.log('Error Redis Hitlog ' + err)
      callback(client, true, err)
  })
}
