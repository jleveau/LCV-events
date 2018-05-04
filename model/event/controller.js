const EventSchema = require("./schema")
const moment = require("moment")
const rules = require("./rules")

class EventController {
    create (event) {
        return new Promise((resolve, reject) => {
            const eventObj = new EventSchema(event)
            this.validate(eventObj)
                .then(() => eventObj.save())
                .then((eventSaved) => resolve(eventSaved))
                .catch(error => reject(error))
        })
    }

    getAll () {
        return EventSchema.find({})
            .populate("participants")
            .populate("not_participants")
            .populate("uncertains")
            .populate("author")
            .exec()
    }

    getById (id) {
        return new Promise((resolve, reject) => {
            if (!id) {
                return reject(new Error("no event id given"))
            }
            return EventSchema.findById(id)
                .populate("participants")
                .populate("not_participants")
                .populate("uncertains")
                .populate("author")
                .exec((err, event) => {
                    if (err) {
                        reject(new Error(err))
                    } else {
                        resolve(event)
                    }
                })
        })
    }

    getByAuthor (id) {
        return new Promise((resolve, reject) => {
            if (!id) {
                return reject(new Error("no regestration id given"))
            }
            return EventSchema.find({ author: id })
                .populate("participants")
                .populate("not_participants")
                .populate("uncertains")
                .populate("author")
                .exec((err, events) => {
                    if (err) {
                        reject(new Error(err))
                    }
                    resolve(events)
                })
        })
    }

    getByParticipating (userId) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                reject(new Error("no user_id given"))
            }
            return EventSchema.find({
                participants: userId
            })
                .populate("participants")
                .populate("not_participants")
                .populate("uncertains")
                .populate("author")
                .exec((err, events) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(events)
                })
        })
    }

    getNext () {
        return new Promise((resolve, reject) => {
            const now = moment().toISOString()
            EventSchema
                .find({ date: { $gte: now } })
                .sort({ "date": 1 })
                .limit(1)
                .populate("participants")
                .populate("not_participants")
                .populate("uncertains")
                .populate("author")
                .exec((err, events) => {
                    if (err) {
                        return reject(err)
                    }
                    if (events.length && events[0]) {
                        return resolve(events[0])
                    }
                    return resolve(null)
                })
        })
    }

    update (event) {
        return new Promise((resolve, reject) => {
            EventSchema.findById(event._id)
                .then((eventObj) => {
                    if (!eventObj) {
                        return reject(new Error("can't find event : " + JSON.stringify(event)))
                    }
                    eventObj.set(event)
                    return this.validate(eventObj)
                        .then(() => eventObj.save())
                        .then((event) => resolve(event))
                        .catch((error) => {
                            return reject(error)
                        })
                })
        })
    }

    delete (eventId) {
        return new Promise((resolve, reject) => {
            return EventSchema.findByIdAndRemove(eventId)
                .then((removedEvent) => {
                    resolve(removedEvent)
                })
                .catch((error) => reject(error))
        })
    }

    validate (event) {
        return Promise.all(rules.map((rule) => rule(event)))
    }
}

module.exports = new EventController()
