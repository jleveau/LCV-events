const config = require("config")
const request = require("request")
const Event = require("../model/event/controller")
const moment = require("moment")
moment.locale("fr")

function displayEventContent (event) {
    let message = config.event_url + event._id + "\n" +
        event.title + "\n" +
        "Crée par : " + event.author.username + "\n" +
        "Début : " + moment(event.date).tz("Europe/Paris").format("LLLL") + "\n"
    if (event.end_date) {
        message += "Fin :" + moment(event.end_date).tz("Europe/Paris").format("LLLL") + "\n"
    }
    if (event.place) {
        message += "Lieu : " + event.place + "\n"
    }
    if (event.description) {
        message += event.description
    }
    return message
}

function sendMessageRequest (message) {
    return new Promise((resolve, reject) => {
        request({
            url: config.DiscordNotifierConfig.url,
            method: "POST",
            json: { message: message }
        }, (error) => {
            if (error) {
                reject(error)
            }
            resolve()
        })
    })
}

class DiscordNotifier {
    sendNotificationCreateEvent (eventId) {
        return Event.getById(eventId)
            .then((event) => {
                event = event.toObject()
                let message = "Nouvel évenement ! \n" + displayEventContent(event)
                return sendMessageRequest(message)
            })
    }

    sendNotificationUpdateEvent (eventId) {
        return Event.getById(eventId)
            .then((event) => {
                event = event.toObject()
                let message = "Modification d'un évenement ! \n" + displayEventContent(event)
                return sendMessageRequest(message)
            })
    }
}

module.exports = new DiscordNotifier()
