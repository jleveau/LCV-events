const express = require("express")
const router = express.Router()
const Transaction = require("../model/transaction/controller")
const logger = require("../logger")

router.post("/", (req, res) => {
    if (!req.body.transaction) {
        return res.status(500).send({ status: 400, message: "no transaction provided" })
    } else {
        logger.info(req.body.transaction)
        Transaction.create(req.body.transaction)
            .then((transaction) => {
                logger.info("creating transaction ", transaction)
                res.status(200).send({ status: 200, transaction })
            })
            .catch((error) => {
                logger.error(error)
                res.status(500).send({ status: 500, message: error.message }
                )
            })
    }
})

router.get("/", (req, res) => {
    const users = req.body.users
    Transaction.get(users)
        .then((transactions) =>
            res.status(200).send({ status: 200, transactions }))
        .catch((error) => {
            res.status(500).send({ status: 500, message: error.message })
        })
})

router.get("/compute", (req, res) => {
    const users = req.body.users
    Transaction.getComputed(users)
        .then((transactions) =>
            res.status(200).send({ status: 200, transactions }))
        .catch((error) =>
            res.status(500).send({ status: 500, message: error.message }))
})

router.delete("/compute", (req, res) => {
    if (!req.params.id) {
        const error = new Error("no transaction id provided")
        logger.error(error)
        res.status(404).send({ status: 404, message: error.message })
    } else {
        Transaction.delete(req.params.id)
            .then((removedTransaction) => {
                res.status(200).send({ status: 200, removedTransaction })
                logger.info("deleting transaction ", req.params.id)
            })
            .catch((error) => {
                res.status(500).send({ status: 500, message: error.message })
            })
    }
})

module.exports = router
