const config = require("config")
const request = require("request")
const Event = require("../model/event/controller")
const moment = require("moment")
moment.locale("fr");

class DiscordNotifier {

    sendNotificationCreateEvent(event_id) {
        return Event.getById(event_id)
            .then((event) => {
                return new Promise((resolve, reject) => {

                    event = event.toObject()
                    let message = "Nouvel Evenement ! \n" +
                    event.title + "\n" +
                    "Crée par : " +event.author.username + "\n" +
                    "Début : " + moment(event.date).format("LLLL").toString() + "\n"
                    if (event.end_date) {
                         message += "Fin :" + moment(event.end_date).format("LLLL").toString()
                    }
                    message += "\n" + event.description
            
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
        })      
    }
}

module.exports = new DiscordNotifier()
