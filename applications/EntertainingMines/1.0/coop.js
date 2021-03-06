const Tile = require('./tile');

class CoopBoard {
    #boardSquares;
    #params;
    #minesRemaining;
    currentTiles;
    
    tiles;
    room;
    
    #isFirstTileRevealed;
    #gameIsOver;
    
    constructor(params, room) {
        this.tiles = [];
        this.#params = params;
        this.room = room;
        this.#gameIsOver = false;
        this.#minesRemaining = params.mines;
        this.#isFirstTileRevealed = false;
        this.currentTiles = {};
        
        for (let y = 0; y < params.height; y++) {
            for (let x = 0; x < params.width; x++) {
                let t = new Tile(y * params.width + x, this);
                t.on("tileUpdate", tile => {
                    room.beam(tile);
                });
                t.on("revealedMine", this.revealedMine.bind(this));
                t.on("tileRevealed", this.tileRevealed.bind(this));
                this.tiles.push(t);
            }
        }
        
    }
    
    generateMines(tileNumber) {
        let adj = this.tilesAdjacent(tileNumber);
        
        for (let i = 0; i < this.#params.mines; i++) {
            let tNum = Math.floor(Math.random() * this.tiles.length);
            let t = this.tiles[tNum];
            if (t.isMine || tNum == tileNumber || adj.includes(tNum)) {
                i--;
            } else {
                t.isMine = true;
            }
        }
    }
    
    boardAction(user, message) {
        if (this.#gameIsOver) return false;
        
        let t = this.tiles[message.tile];
        if (message.action === "reveal") {
            if (!this.#isFirstTileRevealed) {
                this.generateMines(message.tile);
                this.#isFirstTileRevealed = true;
            }
            return t.reveal(user);
        } else if (message.action === "flag") {
            return t.flag(user, message);
        } else if (message.action === "sweep") {
            return t.sweep(user);
        }
    }
    
    currentTileChanged(user, message) {
        if (message.tile < 0 || message.tile >= this.tiles.length) return;
        
        this.currentTiles[user.sessionId] = message.tile;
        
        let currentTiles = [];
        for (let user of this.room.users) {
            let tileDescriptor = this.currentTiles[user.sessionId];
            if (tileDescriptor) {
                currentTiles.push({
                    tile: tileDescriptor,
                    user: user.sessionId,
                    colour: user.colour
                });
            }
        }
        
        //Tell everyone about the current tiles
        this.room.beam({
            "type": "currentTilesChanged",
            "tiles": currentTiles
        });
    }
    
    tilesAdjacent(tileNum) {
        let tiles = [];
        
        let thisPoint = [Math.floor(tileNum % this.#params.width), Math.floor(tileNum / this.#params.width)];
        let checkAndAddPoint = (dx, dy) => {
            let x = thisPoint[0] + dx;
            let y = thisPoint[1] + dy;
            if (x >= 0 && x < this.#params.width && y >= 0 && y < this.#params.height) tiles.push(y * this.#params.width + x);
        }
        
        checkAndAddPoint(-1, -1);
        checkAndAddPoint(-1, 0);
        checkAndAddPoint(-1, 1);
        checkAndAddPoint(0, 1);
        checkAndAddPoint(1, 1);
        checkAndAddPoint(1, 0);
        checkAndAddPoint(1, -1);
        checkAndAddPoint(0, -1);
        
        return tiles;
    }
    
    tile(tileNumber) {
        return this.tiles[tileNumber];
    }
    
    revealedMine(user) {
        this.#gameIsOver = true;
        for (let tile of this.tiles) {
            tile.sendTileUpdate();
        }
        
        this.room.beam({
            "type": "endGame",
            "victory": false,
            "user": user.username,
            "picture": user.picture
        });
        
        setTimeout(() => {
            this.room.endGame();
        }, 5000);
    }
    
    tileRevealed() {
        for (let tile of this.tiles) {
            if (tile.state !== Tile.States.revealed && !tile.isMine) {
                return;
            }
        }
        
        this.#gameIsOver = true;
        this.room.beam({
            "type": "endGame",
            "victory": true
        });
        
        setTimeout(() => {
            this.room.endGame();
        }, 5000);
    }
    
    changeMinesRemaining(increment) {
        this.#minesRemaining += (increment ? 1 : -1);
        this.room.beam({
            "type": "minesRemainingChanged",
            "minesRemaining": this.#minesRemaining
        });
    }
    
    removeUser(user) {
        //noop
    }
    
    get gameIsOver() {
        return this.#gameIsOver;
    }
}

module.exports = CoopBoard;