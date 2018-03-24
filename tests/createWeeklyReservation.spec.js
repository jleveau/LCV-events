process.env.NODE_ENV = "test"
const server = require("../bin/www")// eslint-disable-line no-unused-vars
const chai = require("chai")
const expect = chai.expect
const moment = require("moment")
const Reservation = require("../model/reservation/controller")
const mongoose = require("mongoose")
const Jobs = require("../jobs/jobs")

describe("Jobs", () => {
    before((done) => {
        mongoose.model("Reservation").remove([], () => {
            done()
        })
    })

    describe("creation", () => {
        it("create a weekly reservation for saturday 2pm", (done) => {
            Jobs.createWeeklyReservation()
                .then(() => Reservation.getNext())
                .then((reservation) => {
                    expect(moment(reservation.date).toString())
                        .to.be.eql(
                            moment().set({
                                weekday: 6,
                                hour: 14,
                                minutes: 0,
                                seconds: 0
                            })
                                .toString())
                    expect(moment(reservation.end_date).toString())
                        .to.be.eql(
                            moment().set({
                                weekday: 6,
                                hour: 16,
                                minutes: 0,
                                seconds: 0
                            })
                                .toString())
                    expect(moment(reservation.reservation_limit_date).toString())
                        .to.be.eql(
                            moment().set({
                                weekday: 3,
                                hour: 14,
                                minutes: 0,
                                seconds: 0
                            })
                                .toString())
                    done()
                })
        })
    })
})
