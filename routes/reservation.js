const express = require("express")
const router = express.Router()
const Reservation = require("../model/reservation/controller")
const logger = require("../logger")

router.post("/new", (req, res) => {
    if (!req.body.reservation) {
        return res.status(500).send({ status: 400, message: "no reservation provided" })
    } else {
        logger.info(req.body.reservation)
        Reservation.create(req.body.reservation)
            .then((reservation) => {
                logger.info("creating reservation ", reservation)
                res.status(200).send({ status: 200, reservation })
            })
            .catch((error) => {
                logger.error(error)
                res.status(500).send({ status: 500, message: error.message }
                )
            })
    }
})

router.get("/next", (req, res) => {
    Reservation.getNext()
        .then((reservation) =>
            res.status(200).send({ status: 200, reservation }))
        .catch((error) => {
            logger.error(error)
            res.status(500).send({ status: 500, message: error.message })
        })
})

router.get("/all", (req, res) => {
    Reservation.getAll()
        .then((reservations) =>
            res.status(200).send({ status: 200, reservations }))
        .catch((error) =>
            res.status(500).send({ status: 500, message: error.message }))
})

router.get("/:id", (req, res) => {
    if (req.params.id) {
        Reservation.getById(req.params.id)
            .then((reservation) =>
                res.status(200).send({ status: 200, reservation }))
            .catch((error) =>
                res.status(500).send({ status: 500, message: error.message }))
    } else {
        res.status(400).send({ status: 500, message: "no reservation id provided" })
    }
})

router.put("/update", (req, res) => {
    if (!req.body.reservation) {
        const error = new Error("can't find reservation")
        logger.error(error)
        res.status(404).send({ status: 404, message: error.message })
    } else {
        Reservation.update(req.body.reservation)
            .then((reservation) => {
                res.status(200).send({ status: 200, reservation })
                logger.info("updating reservation ", reservation)
            })
            .catch((error) => {
                logger.error(error)
                res.status(500).send({ status: 500, message: error.message })
            })
    }
})

module.exports = router
