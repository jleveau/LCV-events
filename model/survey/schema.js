const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const user = new mongoose.Schema({})
mongoose.model("User", user)

const schemaSurvey = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    place: { type: String },
    author: { type: ObjectId, ref: "User" },

    created_at: { type: Date, required: true, default: Date.now },
    dates: [{
        start: { type: Date, required: true },
        end: { type: Date, required: true }
    }]
})

const schemaVote = new mongoose.Schema({
    survey: { type: ObjectId, ref: "Survey" },
    voter: { type: ObjectId, ref: "User" },
    created_at: { type: Date, required: true, default: Date.now },
    dates: [{
        start: { type: Date, required: true },
        end: { type: Date, required: true }
    }]
})
module.exports = {
    survey: mongoose.model("Survey", schemaSurvey),
    vote: mongoose.model("Vote", schemaVote)
}
