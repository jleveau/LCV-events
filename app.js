// We’ll declare all our dependencies here
const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const logger = require("./logger")
const config = require("config")
const jobs = require("./jobs/jobs")
const event = require("./routes/event")
const morgan = require("morgan")

// Database connection
const dbConfig = config.DBConfig
const mongoUrl = dbConfig.prefix + dbConfig.host + "/" + dbConfig.name

const connectWithRetry = function () {
    return mongoose.connect(mongoUrl)
        .then(() => {
            logger.info("Connecting to database : " + dbConfig.host)
        })
        .catch((err) => {
            if (err) {
                logger.error(err)
                setTimeout(connectWithRetry, 5000)
            }
        })
}

connectWithRetry()

let db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))

// Initialize our app variable
const app = express()

app.use(morgan("dev"))

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, PUT")
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use("/api/events", event)

jobs.start()

module.exports = app
