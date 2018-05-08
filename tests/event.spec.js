process.env.NODE_ENV = "test"
const server = require("../bin/www")// eslint-disable-line no-unused-vars
const requestSender = require("./request_sender")
const chai = require("chai")
const expect = chai.expect
const moment = require("moment")
const Event = require("../model/event/schema")
const mongoose = require("mongoose")

describe("API", () => {
    describe("Events", () => {
        before((done) => {
            mongoose.model("Event").remove([], () => {
                done()
            })
        })

        describe("delete", (done) => {
            let event
            beforeEach((done) => {
                const event1 = new Event({
                    title: "eventDelete",
                    author: mongoose.Types.ObjectId(),
                    participants: [],
                    not_participants: [],
                    date: moment().toDate(),
                    end_date: moment().add(1, "hour").toDate(),
                    event_limit_date: moment().add(1, "day").toDate()

                })
                Event.remove({})
                    .then(() => event1.save())
                    .then((eventSaved) => {
                        event = eventSaved
                        return done()
                    })
            })

            it("delete an existing event", (done) => {
                Event.count({})
                    .then((count) => new Promise((resolve) => {
                        expect(count).to.be.eql(1)
                        resolve()
                    }))
                    .then(() => {
                        return requestSender.createDelete("/api/events/" + event._id)
                    })
                    .then((response) => {
                        expect(response.status).to.eql(200)
                        expect(response.removedEvent.title).to.eql("eventDelete")
                        return Event.count({})
                    })
                    .then((count) => {
                        expect(count).to.be.eql(0)
                        done()
                    })
                    .catch((error) => done(error))
            })

            it("delete not existing event", (done) => {
                Event.remove({})
                    .then(() => {
                        return requestSender.createDelete("/api/events/" + event._id)
                    })
                    .then((response) => {
                        Event.count({})
                            .then((count) => {
                                expect(count).to.be.eql(0)
                                done()
                            })
                    })
                    .catch((error) => {
                        done(error)
                    })
            })
        })

        describe("creation ", () => {
            it("post /api/events/", (done) => {
                requestSender.createPost("/api/events/", {
                    event:
                        {
                            title: "event",
                            end_date: moment("03-03-2018", "MM-DD-YYYY").toDate(),
                            author: mongoose.Types.ObjectId(),
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

            it("post /api/events/ with an invalid event (breaking rules)", (done) => {
                const user = mongoose.Types.ObjectId()
                requestSender.createPost("/api/events/", {
                    event:
                        {
                            title: "event",
                            event_limit_date: moment("03-03-2018", "MM-DD-YYYY").subtract(1, "day").toDate(),
                            end_date: moment("03-03-2018", "MM-DD-YYYY").toDate(),
                            participants: [user],
                            author: mongoose.Types.ObjectId(),
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

            it("post /api/events/ with an invalid event (user list contains null)", (done) => {
                requestSender.createPost("/api/events/", {
                    event:
                        {
                            title: "event",
                            date: moment("03-03-2018", "MM-DD-YYYY").toDate(),
                            participants: [null],
                            author: mongoose.Types.ObjectId(),
                            not_participants: []
                        }
                })
                    .then((response) => {
                        done("should have failed")
                    })
                    .catch((error) => {
                        expect(error).to.be.eql("User id cannot be null")
                        done()
                    })
            })

            it("send /api/events/new with no event", (done) => {
                requestSender.createPost("/api/events/", {})
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
            it("post /api/events/", (done) => {
                const event = new Event({
                    title: "event",
                    participants: [],
                    not_participants: [],
                    author: mongoose.Types.ObjectId(),
                    event_limit_date: moment().subtract(1, "day").toDate(),
                    end_date: moment().toDate(),
                    date: moment().toDate()
                })
                event.save()
                    .then((eventObj) => new Promise((resolve, reject) => {
                        eventObj.participants.push(mongoose.Types.ObjectId())
                        return resolve(eventObj)
                    }))
                    .then((eventObj) => requestSender.createPut("/api/events/", { event: eventObj }))
                    .then((response) => {
                        expect(response.status).to.be.eql(200)
                        expect(response.event.participants).to.have.lengthOf(1)
                        done()
                    })
                    .catch(done)
            })

            it("put /api/events/ with no event", (done) => {
                requestSender.createPut("/api/events/", {})
                    .then((response) => {
                        done("should have failed")
                    })
                    .catch((error) => {
                        expect(error).to.be.eql("can't find event")
                        done()
                    })
            })

            it("put /api/events/ with a user both participating and not participating", (done) => {
                const user = mongoose.Types.ObjectId()
                const event = new Event({
                    title: "event",
                    participants: [],
                    not_participants: [],
                    author: mongoose.Types.ObjectId(),
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
                    .then((eventObj) => requestSender.createPut("/api/events/", { event: eventObj }))
                    .then((response) => {
                        done("should have failed")
                    })
                    .catch((error) => {
                        expect(error).to.be.eql("A user cannot be both in participants, not_participants and waiting_for_others")
                        done()
                    })
            })

            it("put /api/events/ with a date superior to end date", (done) => {
                const event = new Event({
                    title: "event",
                    date: moment().add(1, "day").toDate(),
                    end_date: moment().toDate(),
                    author: mongoose.Types.ObjectId(),
                    event_limit_date: moment().subtract(1, "hour").toDate()
                })
                event.save()
                    .then((eventObj) => requestSender.createPut("/api/events/", { event: eventObj }))
                    .then((response) => {
                        done("should have failed")
                    })
                    .catch((error) => {
                        expect(error).to.be.eql("date cannot be superior to end_date")
                        done()
                    })
            })

            it("put /api/events/ with a date inferior to event_limit_date", (done) => {
                const event = new Event({
                    title: "event",
                    participants: [],
                    author: mongoose.Types.ObjectId(),
                    not_participants: [],
                    date: moment().toDate(),
                    end_date: moment().add(1, "hour").toDate(),
                    event_limit_date: moment().add(1, "day").toDate()

                })
                event.save()
                    .then((eventObj) => new Promise((resolve, reject) => {
                        return resolve(eventObj)
                    }))
                    .then((eventObj) => requestSender.createPut("/api/events/", { event: eventObj }))
                    .then((response) => {
                        done("should have failed")
                    })
                    .catch((error) => {
                        expect(error).to.be.eql("event limit date cannot be superior to date")
                        done()
                    })
            })
        })

        describe("Get events", (done) => {
            before((done) => {
                let event1 = new Event({
                    title: "event1",
                    participants: [],
                    not_participants: [],
                    date: moment().toDate(),
                    author: mongoose.Types.ObjectId(),
                    end_date: moment().add(1, "hour").toDate(),
                    event_limit_date: moment().subtract(1, "day").toDate()
                })
                let event2 = new Event({
                    title: "event2",
                    participants: [],
                    not_participants: [],
                    author: mongoose.Types.ObjectId(),
                    date: moment().toDate(),
                    end_date: moment().add(1, "hour").toDate(),
                    event_limit_date: moment().subtract(1, "day").toDate()
                })
                let event3 = new Event({
                    title: "event3",
                    participants: [],
                    author: mongoose.Types.ObjectId(),
                    not_participants: [],
                    date: moment().toDate(),
                    end_date: moment().add(1, "hour").toDate(),
                    event_limit_date: moment().subtract(1, "day").toDate()
                })
                Event.remove({})
                    .then(() => event1.save())
                    .then(() => event2.save())
                    .then(() => event3.save())
                    .then(() => done())
                    .catch(done)
            })

            it("get /api/events/all", (done) => {
                requestSender.createGet("/api/events/all")
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

        describe("get next", (done) => {
            let event1, event2, event3

            before((done) => {
                Event.remove()
                    .then(() => {
                        event1 = new Event({
                            title: "event1",
                            author: mongoose.Types.ObjectId(),
                            end_date: moment().add(3, "day").toDate(),
                            event_limit_date: moment().add(1, "day").toDate(),
                            date: moment().add(2, "day").toDate()
                        })
                        return event1.save()
                    })
                    .then(() => {
                        event2 = new Event({
                            title: "event2",
                            author: mongoose.Types.ObjectId(),
                            end_date: moment().add(2, "day").toDate(),
                            event_limit_date: moment().toDate(),
                            date: moment().add(1, "day").toDate()
                        })
                        return event2.save()
                    })
                    .then(() => {
                        event3 = new Event({
                            title: "event3",
                            author: mongoose.Types.ObjectId(),
                            end_date: moment().add(4, "day").toDate(),
                            event_limit_date: moment().add(2, "day").toDate(),
                            date: moment().add(3, "day").toDate()
                        })
                        return event3.save()
                    })
                    .then(() => done())
                    .catch((error) => done(error))
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
                Event.remove({})
                    .then(() => {
                        const event = new Event({
                            title: "event",
                            author: mongoose.Types.ObjectId(),
                            end_date: moment().add(1, "hour").toDate(),
                            event_limit_date: moment().subtract(1, "day").toDate(),
                            date: moment().toDate()
                        })
                        return event.save()
                    })
                    .then((event) => {
                        return new Promise((resolve) => {
                            event1 = event
                            resolve()
                        })
                    })
                    .then(() => {
                        const event = new Event({
                            title: "event",
                            author: mongoose.Types.ObjectId(),
                            end_date: moment().add(1, "hour").toDate(),
                            event_limit_date: moment().subtract(1, "day").toDate(),
                            date: moment().toDate()
                        })

                        return event.save
                    })
                    .then(() => done())
            })

            it("get /api/events/one/?id", (done) => {
                requestSender.createGet("/api/events/one/" + event1._id)
                    .then((response) => {
                        expect(response.status).be.eql(200)
                        expect(response.event._id.toString()).to.eql(event1._id.toString())
                        expect(response.event.title).to.eql(event1.title)
                        expect(moment(response.event.date).toDate()).to.eql(event1.date)

                        done()
                    })
                    .catch((error) => done(error))
            })
        })

        describe("get all event for a Given User", (done) => {
            let user1
            let user2
            let event1, event2, event3
            before((done) => {
                user1 = mongoose.Types.ObjectId()
                user2 = mongoose.Types.ObjectId()

                Event.remove({})
                    .then(() => {
                        const event = new Event({
                            title: "event1",
                            author: user1,
                            end_date: moment().add(1, "hour").toDate(),
                            event_limit_date: moment().subtract(1, "day").toDate(),
                            date: moment(),
                            participants: [user1]
                        })
                        return event.save()
                    })
                    .then((eventSaved) => {
                        event1 = eventSaved
                        const event = new Event({
                            title: "event2",
                            author: user2,
                            end_date: moment().add(1, "hour").toDate(),
                            event_limit_date: moment().subtract(1, "day").toDate(),
                            date: moment(),
                            participants: [user1]
                        })
                        return event.save()
                    })
                    .then((eventSaved) => {
                        event2 = eventSaved
                        const event = new Event({
                            title: "event3",
                            author: user1,
                            end_date: moment().add(1, "hour").toDate(),
                            event_limit_date: moment().subtract(1, "day").toDate(),
                            date: moment(),
                            participants: [user2]
                        })
                        return event.save()
                    })
                    .then((eventSaved) => {
                        event3 = eventSaved
                        done()
                    })
            })

            it("GET /api/events/participating/?id", (done) => {
                requestSender.createGet("/api/events/participating/" + user1)
                    .then((response) => {
                        expect(response.status).be.eql(200)
                        expect(response.events).lengthOf(2)

                        expect(response.events[0]._id).to.be.eql(event1._id.toString())
                        expect(response.events[1]._id).to.be.eql(event2._id.toString())

                        done()
                    })
                    .catch((error) => done(error))
            })

            it("GET /api/events/author/?id", (done) => {
                requestSender.createGet("/api/events/author/" + user1)
                    .then((response) => {
                        expect(response.status).be.eql(200)
                        expect(response.events).lengthOf(2)
                        expect(response.events[0]._id).to.be.eql(event1._id.toString())
                        expect(response.events[1]._id).to.be.eql(event3._id.toString())

                        done()
                    })
                    .catch((error) => done(error))
            })
        })
    })
})
