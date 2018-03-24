const ReservationSchema = require("./schema")
const moment = require("moment")
const rules = require("./rules")

class ReservationController {
    create (reservation) {
        return new Promise((resolve, reject) => {
            const reservationObj = new ReservationSchema(reservation)
            this.validate(reservationObj)
                .then(() => reservationObj.save())
                .then((reservationSaved) => resolve(reservationSaved))
                .catch((error) => reject(error))
        })
    }

    getAll () {
        return ReservationSchema.find({})
    }

    getById (id) {
        return new Promise((resolve, reject) => {
            if (!id) {
                return reject(new Error("no regestration id given"))
            }
            return ReservationSchema.find({ _id: id })
        })
    }

    getNext () {
        return new Promise((resolve, reject) => {
            const now = moment().toISOString()
            ReservationSchema
                .find({ date: { $gte: now } })
                .sort({ "date": 1 })
                .limit(1)
                .exec((err, reservations) => {
                    if (err) {
                        return reject(err)
                    }
                    if (reservations.length && reservations[0]) {
                        return resolve(reservations[0])
                    }
                    return resolve(null)
                })
        })
    }

    update (reservation) {
        return new Promise((resolve, reject) => {
            ReservationSchema.findById(reservation._id)
                .then((reservationObj) => {
                    if (!reservationObj) {
                        return reject(new Error("can't find reservation : " + JSON.stringify(reservation)))
                    }
                    reservationObj.set(reservation)
                    return this.validate(reservationObj)
                        .then(() => reservationObj.save())
                        .then((reservation) => resolve(reservation))
                        .catch((error) => {
                            return reject(error)
                        })
                })
        })
    }

    validate (reservation) {
        return Promise.all(rules.map((rule) => rule(reservation)))
    }
}

module.exports = new ReservationController()
