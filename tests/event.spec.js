process.env.NODE_ENV = "test"
const server = require("../bin/www")// eslint-disable-line no-unused-vars
const requestSender = require("./request_sender")
const chai = require("chai")
const expect = chai.expect
const moment = require("moment")
const async = require("async")
const Event = require("../model/event/schema")
const mongoose = require("mongoose")

describe("API", () => {
    describe("Events", () => {
        before((done) => {
            mongoose.model("Event").remove([], () => {
                done()
            })
        })

        describe("creation ", () => {
            it("send /api/events/new", (done) => {
                requestSender.createPost("/api/events/new", {
                    event:
                        {
                            title: "event",
                            end_date: moment("03-03-2018", "MM-DD-YYYY").toDate(),
                            date: moment("03-03-2018", "MM-DD-YYYY").toDate(),
                            event_limit_date: moment("03-03-2018", "MM-DD-YYYY").subtract(1, "day").toDate(),
                            participants: [mongoose.Types.ObjectId()],
                            waiting_for_other: mongoose.Types.ObjectId(),
                            not_participants: [mongoose.Types.ObjectId()]
                        }
                })
                    .then((response) => {
                        expect(response.status).to.be.eql(200)
                        expect(response.event._id).to.not.eql(undefined)
                        expect(response.event._id).to.not.eql(null)
                        done()
                    })
                    .catch((error) => done(error))
            })

            it("send /api/events/new with an invalid event (breaking rules)", (done) => {
                const user = mongoose.Types.ObjectId()
                requestSender.createPost("/api/events/new", {
                    event:
                        {
                            title: "event",
                            event_limit_date: moment("03-03-2018", "MM-DD-YYYY").subtract(1, "day").toDate(),
                            end_date: moment("03-03-2018", "MM-DD-YYYY").toDate(),
                            participants: [user],
                            not_participants: [user]
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

            it("send /api/events/new with no event", (done) => {
                requestSender.createPost("/api/events/new", {})
                    .then((response) => {
                        done("should have failed")
                    })
                    .catch((error) => {
                        expect(error).to.be.eql("no event provided")
                        done()
                    })
            })
        })

        describe("updates", (done) => {
            it("post /api/events/update", (done) => {
                const event = new Event({
                    title: "event",
                    participants: [],
                    not_participants: [],
                    event_limit_date: moment().subtract(1, "day").toDate(),
                    end_date: moment().toDate(),
                    date: moment().toDate()
                })
                event.save()
                    .then((eventObj) => new Promise((resolve, reject) => {
                        eventObj.participants.push(mongoose.Types.ObjectId())
                        return resolve(eventObj)
                    }))
                    .then((eventObj) => requestSender.createPut("/api/events/update", { event: eventObj }))
                    .then((response) => {
                        expect(response.status).to.be.eql(200)
                        expect(response.event.participants).to.have.lengthOf(1)
                        done()
                    })
                    .catch(done)
            })

            it("post /api/events/update with no event", (done) => {
                requestSender.createPut("/api/events/update", {})
                    .then((response) => {
                        done("should have failed")
                    })
                    .catch((error) => {
                        expect(error).to.be.eql("can't find event")
                        done()
                    })
            })

            it("post /api/events/update with a user both participating and not participating", (done) => {
                const user = mongoose.Types.ObjectId()
                const event = new Event({
                    title: "event",
                    participants: [],
                    not_participants: [],
                    date: moment().toDate(),
                    end_date: moment().add(1, "day").toDate(),
                    event_limit_date: moment().subtract(1, "day").toDate()
                })
                event.save()
                    .then((eventObj) => new Promise((resolve, reject) => {
                        eventObj.participants.push(user)
                        eventObj.not_participants.push(user)
                        return resolve(eventObj)
                    }))
                    .then((eventObj) => requestSender.createPut("/api/events/update", { event: eventObj }))
                    .then((response) => {
                        done("should have failed")
                    })
                    .catch((error) => {
                        expect(error).to.be.eql("A user cannot be both in participants, not_participants and waiting_for_others")
                        done()
                    })
            })

            it("post /api/events/update with a date superior to end date", (done) => {
                const event = new Event({
                    title: "event",
                    date: moment().add(1, "day").toDate(),
                    end_date: moment().toDate(),
                    event_limit_date: moment().subtract(1, "hour").toDate()
                })
                event.save()
                    .then((eventObj) => requestSender.createPut("/api/events/update", { event: eventObj }))
                    .then((response) => {
                        done("should have failed")
                    })
                    .catch((error) => {
                        expect(error).to.be.eql("date cannot be superior to end_date")
                        done()
                    })
            })

            it("post /api/events/update with a date inferior to event_limit_date", (done) => {
                const event = new Event({
                    title: "event",
                    participants: [],
                    not_participants: [],
                    date: moment().toDate(),
                    end_date: moment().add(1, "hour").toDate(),
                    event_limit_date: moment().add(1, "day").toDate()

                })
                event.save()
                    .then((eventObj) => new Promise((resolve, reject) => {
                        return resolve(eventObj)
                    }))
                    .then((eventObj) => requestSender.createPut("/api/events/update", { event: eventObj }))
                    .then((response) => {
                        done("should have failed")
                    })
                    .catch((error) => {
                        expect(error).to.be.eql("event limit date cannot be superior to date")
                        done()
                    })
            })
        })

        describe("retreiving all event", (done) => {
            it("get /api/events/all", (done) => {
                before((done) => {
                    let event1 = new Event({
                        title: "event",
                        participants: [],
                        not_participants: [],
                        date: moment().toDate(),
                        end_date: moment().add(1, "hour").toDate(),
                        event_limit_date: moment().subtract(1, "day").toDate()
                    })
                    let event2 = new Event({
                        title: "event",
                        participants: [],
                        not_participants: [],
                        date: moment().toDate(),
                        end_date: moment().add(1, "hour").toDate(),
                        event_limit_date: moment().subtract(1, "day").toDate()
                    })
                    let event3 = new Event({
                        title: "event",
                        participants: [],
                        not_participants: [],
                        date: moment().toDate(),
                        end_date: moment().add(1, "hour").toDate(),
                        event_limit_date: moment().subtract(1, "day").toDate()
                    })
                    Event.remove({})
                        .then(() => event1.save())
                        .then(() => event2.save())
                        .then(() => event3.save())
                        .catch(done)
                })

                requestSender.createGet("/api/events/")
                    .then((response) => {
                        expect(response.status).be.eql(200)
                        expect(response.events).lengthOf(3)

                        const event = response.events[0]
                        expect(event.created_at).not.to.eql(null)
                        expect(event._id).to.not.eql(null)
                        done()
                    })
                    .catch((error) => done(error))
            })
        })

        describe("retreiving the next event", (done) => {
            let event1, event2, event3

            before((done) => {
                async.waterfall([
                    (next) => Event.remove({}, () => next()),
                    (next) => {
                        event1 = new Event({
                            title: "event",
                            end_date: moment().add(3, "day").toDate(),
                            event_limit_date: moment().add(1, "day").toDate(),
                            date: moment().add(2, "day").toDate()
                        })
                        event2 = new Event({
                            title: "event",
                            end_date: moment().add(2, "day").toDate(),
                            event_limit_date: moment().toDate(),
                            date: moment().add(1, "day").toDate()
                        })
                        event3 = new Event({
                            title: "event",
                            end_date: moment().add(4, "day").toDate(),
                            event_limit_date: moment().add(2, "day").toDate(),
                            date: moment().add(3, "day").toDate()
                        })
                        async.parallel([
                            (next) => event1.save(next),
                            (next) => event2.save(next),
                            (next) => event3.save(next)
                        ], next)
                    }], (err) => done(err))
            })

            it("get /api/events/next", (done) => {
                requestSender.createGet("/api/events/next")
                    .then((response) => {
                        expect(response.status).be.eql(200)
                        const event = response.event
                        expect(moment(event.date).toDate()).to.be.eql(event2.date)
                        done()
                    })
                    .catch((error) => done(error))
            })
        })

        describe("retreiving event by id", (done) => {
            let event1
            before((done) => {
                async.waterfall([
                    (next) => Event.remove({}, () => next()),
                    (next) => {
                        const event = new Event({
                            title: "event",
                            end_date: moment().add(1, "hour").toDate(),
                            event_limit_date: moment().subtract(1, "day").toDate(),
                            date: moment()
                        })
                        event.save((err, savedEvent) => {
                            if (err) {
                                return next(err)
                            }
                            event1 = savedEvent
                            return next()
                        })
                    },
                    (next) => {
                        const event = new Event({
                            title: "event",
                            end_date: moment().add(1, "hour").toDate(),
                            event_limit_date: moment().subtract(1, "day").toDate(),
                            date: moment()
                        })

                        event.save((err, savedEvent) => {
                            if (err) {
                                return next(err)
                            }
                            return next()
                        })
                    }
                ], (err) => done(err))
            })

            it("get /api/events/?id", (done) => {
                requestSender.createGet("/api/events/?id" + event1._id)
                    .then((response) => {
                        expect(response.status).be.eql(200)
                        expect(response.events).lengthOf(1)

                        const event = response.event
                        expect(event._id).to.be.eql(event1._id)
                        done()
                    })
                    .catch((error) => done(error))
            })
        })
    })
})
