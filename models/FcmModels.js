module.exports.updateTotalSubscriber = (topic, client, callback) => {
    try {
      const loc = "subscriber:topic:" + topic
      client.get(loc, (err, reply) => {
        if (err) console.log(err)
        if (!reply) {
            client.set(loc, 1)
            total = 1
            callback(err, total)
        } else {
            client.incr(loc, (err, total) => {
                if (err) console.log(err)
                callback(err, total)
            })
        }
      })
    } catch (err) {
      console.log("500: Failed To Update Redis " + loc + ", Invalid parameters " + err)
      callback(err, 0)
    }
  }
  
  module.exports.getTotalSubscriber = (topic, client, callback) => {
    try {
      const loc = "subscriber:topic:" + topic
      client.get(loc, (err, data) => {
        console.log("RESULT get " + topic + ": " + data)
        if (err) console.log(err)
        callback(false, data)
      })
    } catch (err) {
        console.log("ERROR Redis get " + loc + ", Invalid parameters " + err)
        callback(true, 0)
    }
  }
  