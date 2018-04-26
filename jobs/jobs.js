const Event = require("..//model/event/controller")
const logger = require("../logger")
const moment = require("moment")

const schedule = require("node-schedule")

function nextSaturday () {
    return moment().tz("Europe/Paris").set({

        weekday: 6,
        hour: 14,
        minutes: 0,
        seconds: 0
    })
}

function createWeeklyEvent () {
    return new Promise((resolve, reject) => {
        Event.getNext()
            .then((event) => {
                const date = nextSaturday()
                const endDate = moment(date).add(2, "hours")
                const limitEventDate = moment(date).subtract(3, "day")
                if (!event || (moment(event.date) < date && moment(event.date).diff(date, "hour") > 1)) {
                    resolve(Event.create({
                        title: "Badminton",
                        date: date.toString(),
                        end_date: endDate.toString(),
                        event_limit_date: limitEventDate.toString()
                    }))
                }
                resolve()
            })
            .catch((error) => {
                logger.error(error)
                reject(error)
            })
    })
}

const jobList = [createWeeklyEvent]

function exectureJobs () {
    jobList.forEach((job) => {
        job()
    })
}

module.exports = {
    start: () => {
        exectureJobs()
        schedule.scheduleJob("*/1 * * * *", () => {
            exectureJobs()
        })
    },
    createWeeklyEvent
}
