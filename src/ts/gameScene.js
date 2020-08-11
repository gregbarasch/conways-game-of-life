"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameScene = void 0;
require("./phaserExtensions");
var infoContainer_1 = require("./infoContainer");
var squareInfo_1 = require("./squareInfo");
var squareInfo_2 = require("./squareInfo");
var Rectangle = Phaser.GameObjects.Rectangle;
var GameScene = /** @class */ (function (_super) {
    __extends(GameScene, _super);
    function GameScene() {
        var _this = _super.call(this, GameScene.NAME) || this;
        _this.grid = [];
        // enables and disables our game ticks
        _this.running = false;
        // slow down our update loop by keeping track of time elapsed
        _this.timer = 0;
        return _this;
    }
    GameScene.prototype.preload = function () {
        var _this = this;
        // setup sizes
        // Some small adjustments for strange rendering issues
        this.sqBorderThickness = 1;
        this.gridHeight = this.game.canvas.height;
        this.gridWidth = this.game.canvas.width * GameScene.GRID_X_SCALE;
        this.sqHeight = (this.game.canvas.height - 2) / GameScene.Y_NUM;
        this.sqWidth = (this.game.canvas.width - 2) * GameScene.GRID_X_SCALE / GameScene.X_NUM;
        // setup world
        this.worldTexture = this.add.renderTexture(0, 0, this.gridWidth, this.gridHeight)
            .setOrigin(0)
            .setInteractive()
            .on(Phaser.Input.Events.POINTER_DOWN, function (pointer, x, y) { return _this.toggleTileByPixel(x, y); }, this);
        // setup square paint brushes
        this.aliveSquare = new Rectangle(this, 0, 0, this.sqWidth, this.sqHeight)
            .setName(squareInfo_2.State[squareInfo_2.State.ALIVE])
            .setStrokeStyle(this.sqBorderThickness, GameScene.BORDER_COLOR)
            .setFillStyle(GameScene.ALIVE_COLOR)
            .setOrigin(0);
        this.deadSquare = new Rectangle(this, 0, 0, this.sqWidth, this.sqHeight)
            .setName(squareInfo_2.State[squareInfo_2.State.DEAD])
            .setStrokeStyle(this.sqBorderThickness, GameScene.BORDER_COLOR)
            .setFillStyle(GameScene.DEAD_COLOR)
            .setOrigin(0);
        // new game
        // create initial board state
        for (var y = 0; y < GameScene.Y_NUM; y++) {
            this.grid[y] = [];
            for (var x = 0; x < GameScene.X_NUM; x++) {
                var xPixel = this.xPixelFromTile(x);
                var yPixel = this.yPixelFromTile(y);
                this.worldTexture.draw(this.deadSquare, xPixel, yPixel);
                this.grid[y][x] = new squareInfo_1.SquareInfo(xPixel, yPixel);
            }
        }
        // One more loop to set neighbors (dependent on SquareInfo instantiation)
        for (var y = 0; y < GameScene.Y_NUM; y++) {
            for (var x = 0; x < GameScene.X_NUM; x++) {
                this.grid[y][x].neighbors = this.getNeighbors(x, y);
            }
        }
    };
    GameScene.prototype.create = function () {
        var _this = this;
        this.music = this.sound.add('music', { loop: true });
        this.music.play();
        // Add my info popup window
        this.infoContainer = new infoContainer_1.InfoContainer(this, this.gridWidth / 2, this.gridHeight / 2, this.gridWidth / 2, this.gridHeight / 2);
        this.add.existing(this.infoContainer);
        // Add my UI buttons
        var x = this.gridWidth;
        var buttonSize = this.game.canvas.width - this.gridWidth;
        this.playButton = this.addButton(x, 0, function () {
            _this.running = true;
            _this.playButton.setVisible(false);
            _this.playButton.disableInteractive();
            _this.pauseButton.setVisible(true);
            _this.pauseButton.setInteractive();
        }, this, "buttons", "play", "play_active", "play_active", buttonSize, buttonSize);
        this.pauseButton = this.addButton(x, 0, function () {
            _this.running = false;
            _this.playButton.setVisible(true);
            _this.playButton.setInteractive();
            _this.pauseButton.setVisible(false);
            _this.pauseButton.disableInteractive();
        }, this, "buttons", "pause", "pause_active", "pause_active", buttonSize, buttonSize).setVisible(false);
        this.addButton(x, buttonSize, function () {
            _this.running = false;
            _this.playButton.setVisible(true);
            _this.playButton.setInteractive();
            _this.pauseButton.setVisible(false);
            _this.pauseButton.disableInteractive();
            _this.resetGrid();
        }, this, "buttons", "replay", "replay_active", "replay_active", buttonSize, buttonSize);
        this.addButton(x, this.gridHeight - buttonSize * 2, function () { return _this.infoContainer.setVisible(!_this.infoContainer.visible); }, this, "buttons", "info", "info_active", "info_active", buttonSize, buttonSize);
        this.addButton(x, this.gridHeight - buttonSize, function () { return _this.game.sound.mute = !_this.game.sound.mute; }, this, "buttons", "sound", "sound_active", "sound_active", buttonSize, buttonSize);
    };
    GameScene.prototype.update = function (time, delta) {
        if (this.running) {
            // keep track of time elapsed between update(...) calls via this.timer
            this.timer += delta;
            // once enough time has elapsed, we run our code
            if (this.timer >= GameScene.UPDATE_MS) {
                // stage then apply the new state
                var changes = this.stageTick();
                this.applyTick(changes);
                // reduce our timer back below our threshold so that we can continue iteration
                do {
                    this.timer -= GameScene.UPDATE_MS;
                } while (this.timer >= GameScene.UPDATE_MS);
            }
        }
    };
    // This might need to be fixed in the future, but +1 was for seemingly off by 1 error in rendering
    GameScene.prototype.xPixelFromTile = function (x) {
        return (this.sqWidth * x) + 1;
    };
    GameScene.prototype.yPixelFromTile = function (y) {
        return (this.sqHeight * y) + 1;
    };
    GameScene.prototype.xTileFromPixel = function (xPixel) {
        return Math.floor(xPixel / this.sqWidth);
    };
    GameScene.prototype.yTileFromPixel = function (yPixel) {
        return Math.floor(yPixel / this.sqHeight);
    };
    GameScene.prototype.toggleTileByPixel = function (xPixel, yPixel) {
        var x = this.xTileFromPixel(xPixel);
        var y = this.yTileFromPixel(yPixel);
        this.toggleTile(x, y);
    };
    GameScene.prototype.toggleTile = function (x, y) {
        var squareInfo = this.grid[y][x];
        var square;
        if (squareInfo.isAlive()) {
            squareInfo.state = squareInfo_2.State.DEAD;
            square = this.deadSquare;
        }
        else {
            squareInfo.state = squareInfo_2.State.ALIVE;
            square = this.aliveSquare;
        }
        this.worldTexture.draw(square, squareInfo.xPixel, squareInfo.yPixel);
    };
    GameScene.prototype.getNeighbors = function (x, y) {
        var neighbors = [];
        var startX = (x - 1 < 0) ? x : x - 1;
        var startY = (y - 1 < 0) ? y : y - 1;
        var endX = (x + 1 >= GameScene.X_NUM) ? x : x + 1;
        var endY = (y + 1 >= GameScene.Y_NUM) ? y : y + 1;
        for (var row = startY; row <= endY; row++) {
            for (var col = startX; col <= endX; col++) {
                if (y !== row || x !== col) {
                    neighbors.push(this.grid[row][col]);
                }
            }
        }
        return neighbors;
    };
    GameScene.prototype.stageTick = function () {
        var changed = [];
        this.grid.forEach(function (row) { return row.forEach(function (square) {
            if (square.state !== square.getNextState()) {
                changed.push(square);
            }
        }); });
        return changed;
    };
    GameScene.prototype.applyTick = function (changes) {
        var _this = this;
        changes.forEach(function (square) {
            _this.toggleTileByPixel(square.xPixel, square.yPixel);
        });
    };
    GameScene.prototype.resetGrid = function () {
        var _this = this;
        this.grid.forEach(function (row) { return row.forEach(function (square) {
            if (square.isAlive()) {
                square.state = squareInfo_2.State.DEAD;
                _this.worldTexture.draw(_this.deadSquare, square.xPixel, square.yPixel);
            }
        }); });
    };
    GameScene.NAME = "game_scene";
    GameScene.ALIVE_COLOR = 0x6600ff;
    GameScene.DEAD_COLOR = 0x000000;
    GameScene.BORDER_COLOR = 0x2757C1;
    // grid dimensions
    // Chose factors of canvas width*X_SCALE and canvas height in order to handle rounding issues
    GameScene.X_NUM = 76;
    GameScene.Y_NUM = 72;
    // X axis has empty space on right hand side for buttons
    GameScene.GRID_X_SCALE = .95;
    // update loop speed
    GameScene.UPDATE_MS = 500;
    return GameScene;
}(Phaser.Scene));
exports.GameScene = GameScene;
