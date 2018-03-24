process.env.NODE_ENV = "test"
const server = require("../bin/www")// eslint-disable-line no-unused-vars
const requestSender = require("./request_sender")
const chai = require("chai")
const expect = chai.expect
const moment = require("moment")
const async = require("async")
const Reservation = require("../model/reservation/schema")
const mongoose = require("mongoose")

describe("API", () => {
    describe("Reservations", () => {
        before((done) => {
            mongoose.model("Reservation").remove([], () => {
                done()
            })
        })

        describe("creation ", () => {
            it("send /api/reservation/new", (done) => {
                requestSender.createPost("/api/reservation/new", {
                    reservation:
                    {
                        end_date: moment("03-03-2018", "MM-DD-YYYY").toDate(),
                        date: moment("03-03-2018", "MM-DD-YYYY").toDate(),
                        reservation_limit_date: moment("03-03-2018", "MM-DD-YYYY").subtract(1, "day").toDate(),
                        participants: ["user1"],
                        waiting_for_other: "user2",
                        not_participants: ["user3"]
                    }
                })
                    .then((response) => {
                        expect(response.status).to.be.eql(200)
                        expect(response.reservation._id).to.not.eql(undefined)
                        done()
                    })
                    .catch((error) => done(error))
            })

            it("send /api/reservation/new with an invalid reservation (breaking rules)", (done) => {
                requestSender.createPost("/api/reservation/new", {
                    reservation:
                    {
                        reservation_limit_date: moment("03-03-2018", "MM-DD-YYYY").subtract(1, "day").toDate(),
                        end_date: moment("03-03-2018", "MM-DD-YYYY").toDate(),
                        participants: ["user1"],
                        not_participants: ["user1"]
                    }
                })
                    .then((response) => {
                        done("should have failed")
                    })
                    .catch((error) => {
                        expect(error).to.be.eql("A user cannot be both in participants, not_participants and waiting_for_others")
                        done()
                    })
            })

            it("send /api/reservation/new with no reservation", (done) => {
                requestSender.createPost("/api/reservation/new", {})
                    .then((response) => {
                        done("should have failed")
                    })
                    .catch((error) => {
                        expect(error).to.be.eql("no reservation provided")
                        done()
                    })
            })
        })

        describe("updates", (done) => {
            it("post /api/reservation/update", (done) => {
                const reservation = new Reservation({
                    participants: [],
                    not_participants: [],
                    reservation_limit_date: moment().subtract(1, "day").toDate(),
                    end_date: moment().toDate(),
                    date: moment().toDate()
                })
                reservation.save()
                    .then((reservationObj) => new Promise((resolve, reject) => {
                        reservationObj.participants.push("user1")
                        return resolve(reservationObj)
                    }))
                    .then((reservationObj) => requestSender.createPut("/api/reservation/update", { reservation: reservationObj }))
                    .then((response) => {
                        expect(response.status).to.be.eql(200)
                        expect(response.reservation.participants).to.have.lengthOf(1)
                        done()
                    })
                    .catch(done)
            })

            it("post /api/reservation/update with no reservation", (done) => {
                requestSender.createPut("/api/reservation/update", {})
                    .then((response) => {
                        done("should have failed")
                    })
                    .catch((error) => {
                        expect(error).to.be.eql("can't find reservation")
                        done()
                    })
            })

            it("post /api/reservation/update with a user both participating and not participating", (done) => {
                const reservation = new Reservation({
                    participants: [],
                    not_participants: [],
                    date: moment().toDate(),
                    end_date: moment().toDate(),
                    reservation_limit_date: moment().subtract(1, "day").toDate()
                })
                reservation.save()
                    .then((reservationObj) => new Promise((resolve, reject) => {
                        reservationObj.participants.push("user1")
                        reservationObj.not_participants.push("user1")
                        return resolve(reservationObj)
                    }))
                    .then((reservationObj) => requestSender.createPut("/api/reservation/update", { reservation: reservationObj }))
                    .then((response) => {
                        done("should have failed")
                    })
                    .catch((error) => {
                        expect(error).to.be.eql("A user cannot be both in participants, not_participants and waiting_for_others")
                        done()
                    })
            })

            it("post /api/reservation/update with a date superior to end date", (done) => {
                const reservation = new Reservation({
                    date: moment().add(1, "day").toDate(),
                    end_date: moment().toDate(),
                    reservation_limit_date: moment().subtract(1, "hour").toDate()
                })
                reservation.save()
                    .then((reservationObj) => requestSender.createPut("/api/reservation/update", { reservation: reservationObj }))
                    .then((response) => {
                        done("should have failed")
                    })
                    .catch((error) => {
                        expect(error).to.be.eql("date cannot be superior to end_date")
                        done()
                    })
            })

            it("post /api/reservation/update with a date inferior to reservation_limit_date", (done) => {
                const reservation = new Reservation({
                    participants: [],
                    not_participants: [],
                    date: moment().toDate(),
                    end_date: moment().add(1, "hour").toDate(),
                    reservation_limit_date: moment().add(1, "day").toDate()

                })
                reservation.save()
                    .then((reservationObj) => new Promise((resolve, reject) => {
                        return resolve(reservationObj)
                    }))
                    .then((reservationObj) => requestSender.createPut("/api/reservation/update", { reservation: reservationObj }))
                    .then((response) => {
                        done("should have failed")
                    })
                    .catch((error) => {
                        expect(error).to.be.eql("reservation limit date cannot be superior to date")
                        done()
                    })
            })
        })

        describe("retreiving all reservation", (done) => {
            it("get /api/reservation/all", (done) => {
                before((done) => {
                    let reservation1 = new Reservation({
                        participants: [],
                        not_participants: [],
                        date: moment().toDate(),
                        end_date: moment().add(1, "hour").toDate(),
                        reservation_limit_date: moment().subtract(1, "day").toDate()
                    })
                    let reservation2 = new Reservation({
                        participants: [],
                        not_participants: [],
                        date: moment().toDate(),
                        end_date: moment().add(1, "hour").toDate(),
                        reservation_limit_date: moment().subtract(1, "day").toDate()
                    })
                    let reservation3 = new Reservation({
                        participants: [],
                        not_participants: [],
                        date: moment().toDate(),
                        end_date: moment().add(1, "hour").toDate(),
                        reservation_limit_date: moment().subtract(1, "day").toDate()
                    })
                    Reservation.remove({})
                        .then(() => reservation1.save())
                        .then(() => reservation2.save())
                        .then(() => reservation3.save())
                        .catch(done)
                })

                requestSender.createGet("/api/reservation/")
                    .then((response) => {
                        expect(response.status).be.eql(200)
                        expect(response.reservations).lengthOf(3)

                        const reservation = response.reservations[0]
                        expect(reservation.created_at).not.to.eql(null)
                        expect(reservation._id).to.not.eql(null)
                        done()
                    })
                    .catch((error) => done(error))
            })
        })

        describe("retreiving the next reservation", (done) => {
            let reservation1, reservation2, reservation3

            before((done) => {
                async.waterfall([
                    (next) => Reservation.remove({}, () => next()),
                    (next) => {
                        reservation1 = new Reservation({
                            end_date: moment().add(3, "day").toDate(),
                            reservation_limit_date: moment().add(1, "day").toDate(),
                            date: moment().add(2, "day").toDate()
                        })
                        reservation2 = new Reservation({
                            end_date: moment().add(2, "day").toDate(),
                            reservation_limit_date: moment().toDate(),
                            date: moment().add(1, "day").toDate()
                        })
                        reservation3 = new Reservation({
                            end_date: moment().add(4, "day").toDate(),
                            reservation_limit_date: moment().add(2, "day").toDate(),
                            date: moment().add(3, "day").toDate()
                        })
                        async.parallel([
                            (next) => reservation1.save(next),
                            (next) => reservation2.save(next),
                            (next) => reservation3.save(next)
                        ], next)
                    }], (err) => done(err))
            })

            it("get /api/reservation/next", (done) => {
                requestSender.createGet("/api/reservation/next")
                    .then((response) => {
                        expect(response.status).be.eql(200)
                        const reservation = response.reservation
                        expect(moment(reservation.date).toDate()).to.be.eql(reservation2.date)
                        done()
                    })
                    .catch((error) => done(error))
            })
        })

        describe("retreiving reservation by id", (done) => {
            let reservation1
            before((done) => {
                async.waterfall([
                    (next) => Reservation.remove({}, () => next()),
                    (next) => {
                        const reservation = new Reservation({
                            end_date: moment().add(1, "hour").toDate(),
                            reservation_limit_date: moment().subtract(1, "day").toDate(),
                            date: moment()
                        })
                        reservation.save((err, savedReservation) => {
                            if (err) {
                                return next(err)
                            }
                            reservation1 = savedReservation
                            return next()
                        })
                    },
                    (next) => {
                        const reservation = new Reservation({
                            end_date: moment().add(1, "hour").toDate(),
                            reservation_limit_date: moment().subtract(1, "day").toDate(),
                            date: moment()
                        })

                        reservation.save((err, savedReservation) => {
                            if (err) {
                                return next(err)
                            }
                            return next()
                        })
                    }
                ], (err) => done(err))
            })

            it("get /api/reservation/?id", (done) => {
                requestSender.createGet("/api/reservation/?id" + reservation1._id)
                    .then((response) => {
                        expect(response.status).be.eql(200)
                        expect(response.reservations).lengthOf(1)

                        const reservation = response.reservation
                        expect(reservation._id).to.be.eql(reservation1._id)
                        done()
                    })
                    .catch((error) => done(error))
            })
        })
    })
})
