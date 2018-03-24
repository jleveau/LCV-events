const moment = require("moment")

module.exports = [
    function cantBothParticipateAndNotParticipate (reservation) {
        return new Promise((resolve, reject) => {
            if (reservation.participants.some((participant) =>
                reservation.not_participants.some((notParticipant) => {
                    return notParticipant.toString() === participant.toString() && participant.toString !== reservation.waiting_for_other
                })
            )) {
                return reject(new Error("A user cannot be both in participants, not_participants and waiting_for_others"))
            }
            return resolve()
        })
    },
    function reservationLimitDateCannotBeSuperioToDate (reservation) {
        return new Promise((resolve, reject) => {
            if (moment(reservation.date) >= moment(reservation.reservation_limit_date)) {
                return resolve()
            }
            return reject(new Error("reservation limit date cannot be superior to date"))
        })
    },
    function dateCannotBeSuperiorToEndDate (reservation) {
        return new Promise((resolve, reject) => {
            if (moment(reservation.date) <= moment(reservation.end_date)) {
                return resolve()
            }
            return reject(new Error("date cannot be superior to end_date"))
        })
    }
]
