"use strict";

class Room {
    #id;
    #users = [];
    #ownerId;

    constructor(id, ownerId) {
        this.#id = id;
        this.#ownerId = ownerId;
        this.#users.push(ownerId);
    }

    addUser(userId) {
        if(this.#users.includes(userId)) {
            
        }
    }
}

module.exports = Room;
