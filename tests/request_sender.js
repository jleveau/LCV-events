const request = require("request")
class TestHttpSender {
    static createPost (url, body) {
        return new Promise((resolve, reject) => {
            request({
                url: "http://localhost:3000" + url,
                method: "POST",
                json: body
            }, (error, response, body) => {
                if (response.statusCode === 200) {
                    return resolve(body)
                } else {
                    return reject(error || body.message || "An error has happened")
                }
            })
        })
    }

    static createPut (url, body) {
        return new Promise((resolve, reject) => {
            request({
                url: "http://localhost:3000" + url,
                method: "PUT",
                json: body
            }, (error, response, body) => {
                if (response.statusCode === 200) {
                    return resolve(body)
                } else {
                    return reject(error || body.message || "An error has happened")
                }
            })
        })
    }

    static createGet (url) {
        return new Promise((resolve, reject) => {
            request({
                url: "http://localhost:3000" + url,
                method: "GET"
            }, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    try {
                        body = JSON.parse(body)
                        resolve(body)
                    } catch (error) {
                        resolve(body)
                    }
                } else {
                    reject(error)
                }
            })
        })
    }

    static createDelete (url, body) {
        return new Promise((resolve, reject) => {
            request({
                url: "http://localhost:3000" + url,
                method: "DELETE",
                json: body
            }, (error, response, body) => {
                if (response.statusCode === 200) {
                    return resolve(JSON.parse(body))
                } else {
                    console.log(error, body)
                    return reject(error || body.message)
                }
            })
        })
    }
}

module.exports = TestHttpSender
