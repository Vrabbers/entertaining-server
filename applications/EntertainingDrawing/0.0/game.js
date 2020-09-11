"use strict";

const Room = require("./room.js")

class Game {
    #clients = [];
    #rooms = [];

    tryAddClient(client) {
        if (this.#clients.every(i => i.userId != client.userId)) {
            this.#clients.push(client);
            
        }
    }
}

module.exports = Game;