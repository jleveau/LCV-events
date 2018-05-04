const TransactionSchema = require("./schema")

class TransactionController {
    create (transaction) {
        return new Promise((resolve, reject) => {
            const TransactionObj = new TransactionSchema(transaction)
            TransactionObj.save()
                .then((TransactionSaved) => resolve(TransactionSaved))
                .catch(error => reject(new Error(error)))
        })
    }

    get (users = []) {
        return new Promise((resolve, reject) =>
            TransactionSchema.find({
                $or: [{
                    from: {
                        $in: users
                    }
                }, {
                    to: {
                        $in: users
                    }
                }]
            })
                .then((transactions) => {
                    resolve(transactions)
                })
                .catch((error) => {
                    reject(new Error(error))
                })
        )
    }

    getSent (users = []) {
        return new Promise((resolve, reject) => {
            TransactionSchema.aggregate([
                {
                    $group:
                        {
                            _id: { $from: "$from" },
                            fromTotal: { $sum: { $amount: "$amount" } }
                        }
                }
            ])
                .then((data) => {
                    resolve(data)
                })
                .catch((error) => reject(new Error(error)))
        })
    }

    getReceived (users = []) {
        return new Promise((resolve, reject) => {
            TransactionSchema.aggregate([
                {
                    $group:
                        {
                            _id: { $from: "$to" },
                            fromTotal: { $sum: { $amount: "$amount" } }
                        }
                }
            ])
                .then((data) => {
                    resolve(data)
                })
                .catch((error) => reject(new Error(error)))
        })
    }

    getComputed (users = []) {
        return new Promise((resolve, reject) => {
            let received, sent
            this.getReceived(users)
                .then((amountReceived) => {
                    received = amountReceived
                    return this.getSent(users)
                })
                .then((amountSent) => {
                    sent = amountSent
                    resolve(received - sent)
                })
        })
    }

    delete (id) {
        return new Promise((resolve, reject) => {
            TransactionSchema.remove({ _id: id })
                .then(() => resolve())
                .catch((error) => reject(new Error(error)))
        })
    }
}
module.exports = new TransactionController()
