const Reservation = require("..//model/reservation/controller")
const logger = require("../logger")
const moment = require("moment")

const schedule = require("node-schedule")

function nextSaturday () {
    return moment().set({
        weekday: 6,
        hour: 14,
        minutes: 0,
        seconds: 0
    }).tz("Europe/Paris")
}

function createWeeklyReservation () {
    return new Promise((resolve, reject) => {
        Reservation.getNext()
            .then((reservation) => {
                const date = nextSaturday()
                console.log(date.utc().format())
                const endDate = moment(date).add(2, "hours")
                const limitReservationDate = moment(date).subtract(3, "day")
                if (!reservation || (moment(reservation.date) < date && moment(reservation.date).diff(date, "hour") > 1)) {
                    const reservationNew = {
                        date: date.utc().format(),
                        end_date: endDate.utc().format(),
                        reservation_limit_date: limitReservationDate.utc().format()
                    }
                    resolve(Reservation.create(reservationNew))
                }
                resolve()
            })
            .catch((error) => {
                logger.error(error)
                reject(error)
            })
    })
}

const jobList = [createWeeklyReservation]

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
    createWeeklyReservation
}
