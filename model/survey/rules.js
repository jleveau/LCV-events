
module.exports = {

    survey: [
        function noDuplicateDates (survey) {
            return new Promise((resolve, reject) => {
                for (let dateCouple1 of survey.dates) {
                    let count = 0
                    for (let dateCouple2 of survey.dates) {
                        if (dateCouple1.start === dateCouple2.start && dateCouple1.end === dateCouple2.end) {
                            ++count
                        }
                    }
                    if (count > 1) {
                        reject(new Error("A survey cannot contain duplicated dates"))
                    }
                }
                return resolve()
            })
        }
    ],

    vote: [
        function noDuplicateDates (vote) {
            return new Promise((resolve, reject) => {
                for (let dateCouple1 of vote.dates) {
                    let count = 0
                    for (let dateCouple2 of vote.dates) {
                        if (dateCouple1.start === dateCouple2.start && dateCouple1.end === dateCouple2.end) {
                            ++count
                        }
                    }
                    if (count > 1) {
                        reject(new Error("A vote cannot contain duplicated dates"))
                    }
                }
                return resolve()
            })
        }
    ]
}
