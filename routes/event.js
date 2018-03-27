const express = require("express")
const router = express.Router()
const Event = require("../model/event/controller")
const logger = require("../logger")

router.post("/new", (req, res) => {
    if (!req.body.event) {
        return res.status(500).send({ status: 400, message: "no event provided" })
    } else {
        logger.info(req.body.event)
        Event.create(req.body.event)
            .then((event) => {
                logger.info("creating event ", event)
                res.status(200).send({ status: 200, event })
            })
            .catch((error) => {
                logger.error(error)
                res.status(500).send({ status: 500, message: error.message }
                )
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

router.get("/:id", (req, res) => {
    if (req.params.id) {
        Event.getById(req.params.id)
            .then((event) =>
                res.status(200).send({ status: 200, event }))
            .catch((error) =>
                res.status(500).send({ status: 500, message: error.message }))
    } else {
        res.status(400).send({ status: 500, message: "no event id provided" })
    }
})

router.put("/update", (req, res) => {
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

module.exports = router
