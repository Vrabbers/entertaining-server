"use strict";

const winston = require("winston");
const db = require("../../../db.js");
const Game = require("./game.js");

let game = new Game();

class Client {
    #webSocket;
    #username;
    #id;
    #color;
    #roomInside;
    #inRoom = false;

    constructor(ws, name, id) {
        this.#webSocket = ws;
        this.#username = name;
        this.#id = id;
        this.#color = colorFromUserId(uid);

        this.#webSocket.on("close", (code, reason) => {
            winston.log("silly", `Entertaining Drawing Server client ${this.#user.username} (${this.#user.userId}) disconnected due to ${code}: ${reason}`);
        });

        this.#webSocket.on("jsonMessage", this.#handleMessage.bind(this));

        if(!game.tryAddClient(this)) {
            ws.close(4000, "login.alreadyin");
            return;
        }

        winston.log("verbose", `Entertaining Drawing client initialized for user ${this.#user.username} (${this.#user.userId})`);
    }

    async #handleMessage(message) {

    }

    async getPictureAsync() {
        let i = await db.userForUsername(username);
        return i.gravHash;
    }

    get username() {
        return this.#username;
    }

    get id() {
        return this.#id;
    }

    get color() {
        return this.#color;
    }

    static displayName() { 
        return "Entertaining Drawing" 
    };
}

module.exports = Client;