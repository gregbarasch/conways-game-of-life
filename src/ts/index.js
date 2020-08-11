"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("phaser");
var gameScene_1 = require("./gameScene");
var titleScene_1 = require("./titleScene");
var config = {
    type: Phaser.AUTO,
    parent: "main",
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    width: 1280,
    height: 720
};
var game = new Phaser.Game(config);
game.scene.add(gameScene_1.GameScene.NAME, new gameScene_1.GameScene());
game.scene.add(titleScene_1.TitleScene.NAME, new titleScene_1.TitleScene(), true);
