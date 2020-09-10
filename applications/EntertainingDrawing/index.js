'use strict';

import winston from 'winston';
import Room from './room';
import crypto from 'crypto';
import db from '../../../db.js';
import Game from './game.js';

let game = new Game();

class Client {
    #webSocket;
    #username;
    #userId;
    #picture;
    #color;

    constructor(ws, un, uid) {
        this.#webSocket = ws;
        this.#username = un;
        this.#userId = uid;
        this.#color = colorFromUserId(uid);
        
        this.#webSocket.on("close", (code, reason) => {
            winston.log('silly', `Entertaining Drawing Server client ${this.#username} (${this.#userId}) disconnected due to ${code}: ${reason}`);
        });
    


        this.#webSocket.on("jsonMessage", this.#handleMessage.bind(this));

        winston.log('verbose', `Entertaining Drawing client initialized for user ${this.#username} (${this.#userId})`);

    }

    async getPictureAsync() {
        let i = await db.userForUsername(username);
        return i.gravHash;
    }

    static displayName() { return "Entertaining Drawing" };
}

function colorFromUserId(userId) {
    // Algorithm for converting between HSV taken from Wikipedia:
    // https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB
    // i copied this from victor's entertaining mines.
    let h = userId % 360;
    let s = 1;
    let v = 0.5;
    
    let c = v * s;
    let hPr = h / 60;
    let x = c * (1 - Math.abs(hPr % 2 - 1));
    
    let rgb1;
    if (hPr <= 1) {
        rgb1 = [c, x, 0];
    } else if (hPr <= 2) {
        rgb1 = [x, c, 0];
    } else if (hPr <= 3) {
        rgb1 = [0, c, x];
    } else if (hPr <= 4) {
        rgb1 = [0, x, c];
    } else if (hPr <= 5) {
        rgb1 = [x, 0, c];
    } else {
        rgb1 = [c, 0, x];
    }
    
    let m = v - c;
    let rgb = rgb1.map(y => {
        return Math.round((y + m) * 255);
    });
    console.log(rgb);
    
    let colBuf = Buffer.allocUnsafe(4);
    colBuf.writeUInt8(0xFF);
    Buffer.from(rgb).copy(colBuf, 1);
    
    
    return colBuf.readUInt32BE(0);
}