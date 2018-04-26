const moment = require("moment")

module.exports = [
    function cantBothParticipateAndNotParticipate (event) {
        return new Promise((resolve, reject) => {
            if (event.participants.some((participant) =>
                event.not_participants.some((notParticipant) => 
                    notParticipant.toString() === participant.toString() && participant.toString !== event.waiting_for_other)
            )) {
                return reject(new Error("A user cannot be both in participants, not_participants and waiting_for_others"))
            }
            return resolve()
        })
    },
    function eventLimitDateCannotBeSuperioToDate (event) {

        return new Promise((resolve, reject) => {
            if (!event.event_limit_date) {
                return resolve()
            } else if (moment(event.date) >= moment(event.event_limit_date)) {
                return resolve()
            }
            return reject(new Error("event limit date cannot be superior to date"))
        })
    },
    function dateCannotBeSuperiorToEndDate (event) {
        return new Promise((resolve, reject) => {
            if (!event.end_date) {
                return resolve()
            } else if (moment(event.date) <= moment(event.end_date)) {
                return resolve()
            }
            return reject(new Error("date cannot be superior to end_date"))
        })
    },

    function validParticipants (event) {
        return new Promise((resolve, reject) => {
            if (event.participants.some((user) => !user) ||
                event.not_participants.some((user) => !user) ||
                event.uncertains.some((user) => !user)
            ) {
                reject(new Error("User id cannot be null"))
            }
            return resolve()
        })
    }
]
