const express = require("express")
const router = express.Router()
const Event = require("../model/event/controller")
const logger = require("../logger")
const discordNotifier = require("../tools/discord")

router.post("/", (req, res) => {
    if (!req.body.event) {
        return res.status(500).send({ status: 400, message: "no event provided" })
    } else {
        logger.info(req.body.event)
        Event.create(req.body.event)
            .then((event) => {
                logger.info("creating event ", event)
                discordNotifier.sendNotificationCreateEvent(event._id)
                    .catch((error) => {
                        console.log(error)
                        logger.error(error)
                    })
                res.status(200).send({ status: 200, event })
            })
            .catch((error) => {
                logger.error(error)
                res.status(500).send({ status: 500, message: error.message }
                )
            })
    }
})

router.get("/author/:author_id", (req, res) => {
    if (!req.params.id) {
        const error = new Error("no author id provided")
        logger.error(error)
        res.status(404).send({ status: 404, message: error.message })
    } else {
        Event.getByAuthor(req.params.author_id)
            .then((events) => {
                res.status(200).send({ status: 200, events })
            })
            .catch((error) => {
                logger.error(error)
                res.status(500).send({ status: 500, message: error.message })
            })
    }
})

router.get("/participating/:user_id", (req, res) => {
    if (!req.params.id) {
        const error = new Error("no author id provided")
        logger.error(error)
        res.status(404).send({ status: 404, message: error.message })
    } else {
        Event.getByParticipating(req.params.user_id)
            .then((events) => {
                res.status(200).send({ status: 200, events })
            })
            .catch((error) => {
                logger.error(error)
                res.status(500).send({ status: 500, message: error.message })
            })
    }
})

router.get("/next", (req, res) => {
    Event.getNext()
        .then((event) =>
            res.status(200).send({ status: 200, event }))
        .catch((error) => {
            logger.error(error)
            res.status(500).send({ status: 500, message: error.message })
        })
})

router.get("/all", (req, res) => {
    Event.getAll()
        .then((events) =>
            res.status(200).send({ status: 200, events }))
        .catch((error) =>
            res.status(500).send({ status: 500, message: error.message }))
})

router.get("/one/:id", (req, res) => {
    if (req.params.id) {
        Event.getById(req.params.id)
            .then((event) => {
                res.status(200).send({ status: 200, event })})
            
            .catch((error) => {
                console.log(error)
                res.status(500).send({ status: 500, message: error.message })
            })
    } else {
        res.status(400).send({ status: 500, message: "no event id provided" })
    }
})

router.put("/", (req, res) => {
    if (!req.body.event) {
        const error = new Error("can't find event")
        logger.error(error)
        res.status(404).send({ status: 404, message: error.message })
    } else {
        Event.update(req.body.event)
            .then((event) => {
                res.status(200).send({ status: 200, event })
                logger.info("updating event ", event)
            })
            .catch((error) => {
                logger.error(error)
                res.status(500).send({ status: 500, message: error.message })
            })
    }
})

router.delete("/:id", (req, res) => {
    if (!req.params.id) {
        const error = new Error("no event id provided")
        logger.error(error)
        res.status(404).send({ status: 404, message: error.message })
    } else {
        Event.delete(req.params.id)
            .then((removedEvent) => {
                res.status(200).send({ status: 200, removedEvent })
                logger.info("deleting event ", req.params.id)
            })
            .catch((error) => {
                res.status(500).send({ status: 500, message: error.message })
            })
    }
})

module.exports = router
