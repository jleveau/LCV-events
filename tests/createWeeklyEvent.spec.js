process.env.NODE_ENV = "test"
const server = require("../bin/www")// eslint-disable-line no-unused-vars
const chai = require("chai")
const expect = chai.expect
const moment = require("moment")
const Event = require("../model/event/controller")
const mongoose = require("mongoose")
const Jobs = require("../jobs/jobs")

describe("Jobs", () => {
    before((done) => {
        mongoose.model("Event").remove([], () => {
            done()
        })
    })

    describe("creation", () => {
        it("create a weekly event for saturday 2pm", (done) => {
            Jobs.createWeeklyEvent()
                .then(() => Event.getNext())
                .then((event) => {
                    expect(moment(event.date).toString())
                        .to.be.eql(
                            moment().set({
                                weekday: 6,
                                hour: 14,
                                minutes: 0,
                                seconds: 0
                            })
                                .toString())
                    expect(moment(event.end_date).toString())
                        .to.be.eql(
                            moment().set({
                                weekday: 6,
                                hour: 16,
                                minutes: 0,
                                seconds: 0
                            })
                                .toString())
                    expect(moment(event.event_limit_date).toString())
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
