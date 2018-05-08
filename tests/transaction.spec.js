process.env.NODE_ENV = "test"
const server = require("../bin/www")// eslint-disable-line no-unused-vars
const requestSender = require("./request_sender")
const chai = require("chai")
const expect = chai.expect
const mongoose = require("mongoose")
const Transaction = mongoose.model("Transaction")

describe("API", () => {
    describe("Transaction", () => {
        before((done) => {
            Transaction.remove([], () => {
                done()
            })
        })

        describe("create", () => {
            it("post /api/transactions/", (done) => {
                const user1 = mongoose.Types.ObjectId()
                const user2 = mongoose.Types.ObjectId()

                requestSender.createPost("/api/transactions/", {
                    transaction:
                        {
                            from: {
                                item: user1,
                                kind: "User"
                            },
                            to: {
                                item: user2,
                                kind: "User"
                            },
                            amount: 6
                        }
                })
                    .then((response) => {
                        expect(response.status).to.be.eql(200)
                        expect(response.transaction._id).to.not.eql(undefined)
                        expect(response.transaction.amount).to.eql(6)
                        expect(response.transaction.from.item.toString()).to.eql(user1.toString())
                        expect(response.transaction.to.item.toString()).to.eql(user2.toString())
                        done()
                    })
                    .catch((error) => done(error))
            })
        })

        describe("get", () => {
            const user1 = mongoose.Types.ObjectId()
            const user2 = mongoose.Types.ObjectId()
            const user3 = mongoose.Types.ObjectId()

            before((done) => {
                Transaction.remove({})
                    .then(() => {
                        return Transaction.create({
                            from: {
                                item: user1,
                                kind: "User"
                            },
                            to: {
                                item: user2,
                                kind: "User"
                            },
                            amount: 6
                        })
                    })
                    .then(() => {
                        return Transaction.create({
                            from: {
                                item: user2,
                                kind: "User"
                            },
                            to: {
                                item: user1,
                                kind: "User"
                            },
                            amount: 5
                        })
                    })
                    .then(() => {
                        return Transaction.create({
                            from: {
                                item: user3,
                                kind: "User"
                            },
                            to: {
                                item: user1,
                                kind: "User"
                            },
                            amount: 4
                        })
                    })
                    .then(() => done())
            })

            it("get /api/transactions/", (done) => {
                requestSender.createGet("/api/transactions/", {
                    users: [user1, user3]
                })
                    .then((response) => {
                        done()
                    })
                    .catch((error) => {
                        done(error)
                    })
            })
        })
    })
})
