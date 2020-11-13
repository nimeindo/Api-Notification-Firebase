const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const env = require("dotenv")
const app = express()
env.config()
const RunningPort = process.env.RUNNING_PORT

// Router
const firebaseRoute = require('./routers/firebaseRoute')

// midleware
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))//biar bsa di injek

// Routes
app.use('/FBv1',firebaseRoute)

app.use((req, res, next)=>{
    const err = new Error("Not Found");
    err.status = 404
    next(err);
})

// error handller function
app.use((err, req, res, next) =>{
    const error = app.get('env') === 'development' ? err : {};
    const status = err.status || 500;
    // response to client
    res.status(status).json({
        error:{
            message: error.message
        }
    })
    // response to ourselves
    console.error(err);
})

// start the server
const port = app.get('port') || RunningPort;
app.listen(port, () => console.log('Server is listening on port '+port ));