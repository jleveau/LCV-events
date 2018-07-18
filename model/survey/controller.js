const SurveySchema = require("./schema").survey
const VoteSchema = require("./schema").vote
const surveyRules = require("./rules").survey
const voteRules = require("./rules").vote

class SurveyController {
    create (survey) {
        return new Promise((resolve, reject) => {
            const surveyObj = new SurveySchema(survey)
            this.validate(surveyObj)
                .save()
                .then((surveySaved) => resolve(surveySaved))
                .catch(error => reject(error))
        })
    }

    update (survey) {
        return new Promise((resolve, reject) => {
            SurveySchema.findById(survey._id)
                .then((surveyObj) => {
                    if (!surveyObj) {
                        return reject(new Error("can't find survey : " + JSON.stringify(survey)))
                    }
                    surveyObj.set(survey)
                    return this.validate(surveyObj)
                        .then(() => surveyObj.save())
                        .then((event) => resolve(event))
                        .catch((error) => {
                            return reject(error)
                        })
                })
        })
    }

    getAll () {
        return SurveySchema.find({})
            .populate("author")
            .populate("dates")
            .exec()
    }

    getById (id) {
        return new Promise((resolve, reject) => {
            if (!id) {
                return reject(new Error("no survey id given"))
            }
            return SurveySchema.findById(id)
                .populate("author")
                .populate("dates")
                .exec((err, survey) => {
                    if (err) {
                        reject(new Error(err))
                    } else {
                        resolve(survey)
                    }
                })
        })
    }

    delete (id) {
        return new Promise((resolve, reject) => {
            return SurveySchema.findByIdAndRemove(id)
                .then((removedEvent) => {
                    resolve(removedEvent)
                })
                .catch((error) => reject(error))
        })
    }

    validate (survey) {
        return Promise.all(surveyRules.map((rule) => rule(survey)))
    }
}

class VoteController {
    create (vote) {
        return new Promise((resolve, reject) => {
            const voteObj = new VoteSchema(vote)
            voteObj.save()
                .then((surveySaved) => resolve(surveySaved))
                .catch(error => reject(error))
        })
    }

    update (vote) {
        return new Promise((resolve, reject) => {
            VoteSchema.findById(vote._id)
                .then((voteObj) => {
                    if (!voteObj) {
                        return reject(new Error("can't find vote : " + JSON.stringify(vote)))
                    }
                    voteObj.set(vote)
                    return this.validate(voteObj)
                        .then(() => voteObj.save())
                        .then((voteSaved) => resolve(voteSaved))
                        .catch((error) => {
                            return reject(error)
                        })
                })
        })
    }

    getAll () {
        return VoteSchema.find({})
            .populate("voter")
            .populate("dates")
            .exec()
    }

    getById (id) {
        return new Promise((resolve, reject) => {
            if (!id) {
                return reject(new Error("no vote id given"))
            }
            return VoteSchema.findById(id)
                .populate("voter")
                .populate("dates")
                .exec((err, vote) => {
                    if (err) {
                        reject(new Error(err))
                    } else {
                        resolve(vote)
                    }
                })
        })
    }

    delete (id) {
        return new Promise((resolve, reject) => {
            return VoteSchema.findByIdAndRemove(id)
                .then((removedEvent) => {
                    resolve(removedEvent)
                })
                .catch((error) => reject(error))
        })
    }

    validate (vote) {
        return Promise.all(voteRules.map((rule) => rule(vote)))
    }
}

module.exports = {
    Survey: new SurveyController(),
    Vote: new VoteController()
}
