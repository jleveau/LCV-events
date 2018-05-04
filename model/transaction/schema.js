const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const schema = new mongoose.Schema({
    from: {
        kind: { type: String, required: true },
        item: { type: ObjectId, refPath: "from.kind" }
    },
    to: {
        kind: { type: String, required: true },
        item: { type: ObjectId, refPath: "to.kind" }
    },
    amount: { type: Number, required: true },
    created_at: { type: Date, required: true, default: Date.now }
})
module.exports = mongoose.model("Transaction", schema)
