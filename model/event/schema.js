const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    created_at: { type: Date, required: true, default: Date.now },
    event_limit_date: { type: Date, required: true },
    date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    participants: [{ type: String }],
    not_participants: [{ type: String }],
    uncertains: [{ type: String }]
})
module.exports = mongoose.model("Event", schema)
