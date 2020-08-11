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
exports.TitleScene = void 0;
var gameScene_1 = require("./gameScene");
var TitleScene = /** @class */ (function (_super) {
    __extends(TitleScene, _super);
    function TitleScene() {
        return _super.call(this, TitleScene.NAME) || this;
    }
    TitleScene.prototype.preload = function () {
        this.load.image('title_screen', 'img/title_screen.png');
        this.load.audio('coin', 'snd/coin_grab.wav');
        // hijacking title screen to work as bootloader for other assets
        this.load.multiatlas('buttons', 'img/buttons.json', 'img');
        this.load.audio('music', 'snd/crazy_games__wake_up.mp3', { instances: 1 });
        this.load.image('window', 'img/window.png');
        this.load.bitmapFont('arcade', 'font/arcade.png', 'font/arcade.xml');
    };
    TitleScene.prototype.create = function () {
        var _this = this;
        var coinSound = this.sound.add('coin');
        this.cameras.main.fadeIn(4000);
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'title_screen');
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, function (cam, effect) {
            coinSound.play();
            _this.time.delayedCall(1500, function () {
                _this.cameras.main.fadeOut(2000);
            });
        });
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, function (cam, effect) {
            _this.scene.start(gameScene_1.GameScene.NAME);
        });
    };
    TitleScene.NAME = "title_scene";
    return TitleScene;
}(Phaser.Scene));
exports.TitleScene = TitleScene;
