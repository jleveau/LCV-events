const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const user = new mongoose.Schema({})
mongoose.model("User", user)

const schema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    place: { type: String },
    author: { type: ObjectId, ref: "User" },

    created_at: { type: Date, required: true, default: Date.now },
    event_limit_date: { type: Date },

    date: { type: Date, required: true },
    end_date: { type: Date },

    participants: [{ type: ObjectId, ref: "User" }],
    not_participants: [{ type: ObjectId, ref: "User" }],
    uncertains: [{ type: ObjectId, ref: "User" }]
})
module.exports = mongoose.model("Event", schema)
