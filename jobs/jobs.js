const Reservation = require("..//model/reservation/controller")
const logger = require("../logger")
const moment = require("moment")

const schedule = require("node-schedule")

function nextSaturday () {
    return  moment().tz("Europe/Paris").set({
        weekday: 6,
        hour: 14,
        minutes: 0,
        seconds: 0
    })
}

function createWeeklyReservation () {
    return new Promise((resolve, reject) => {
        Reservation.getNext()
            .then((reservation) => {
                const date = nextSaturday()
                const endDate = moment(date).add(2, "hours")
                const limitReservationDate = moment(date).subtract(3, "day")
                if (!reservation || (moment(reservation.date) < date && moment(reservation.date).diff(date, "hour") > 1)) {
                    const reservationNew = {
                        date: date.toString(),
                        end_date: endDate.toString(),
                        reservation_limit_date: limitReservationDate.toString()
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
