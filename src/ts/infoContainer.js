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
exports.InfoContainer = void 0;
require("./phaserExtensions");
/**
 * Informational window that opens when you click the "i" button
 */
var InfoContainer = /** @class */ (function (_super) {
    __extends(InfoContainer, _super);
    function InfoContainer(scene, x, y, width, height) {
        var _this = _super.call(this, scene, x, y) || this;
        var myWidth = width !== undefined ? width : _this.scene.game.canvas.width / 2;
        var myHeight = height !== undefined ? height : _this.scene.game.canvas.height / 2;
        var xOffset = myWidth / 2;
        var yOffset = myHeight / 2;
        var window = _this.scene.add.image(0, 0, 'window')
            .setSize(myWidth, myHeight)
            .setDisplaySize(myWidth, myHeight);
        var xButtonSize = 50;
        var xButton = _this.scene.addButton(xOffset - xButtonSize, 0 - yOffset, function () { return _this.setVisible(false); }, _this, "buttons", "close", "close_active", "close_active", xButtonSize, xButtonSize);
        var textAStr = "" +
            "Click the tiles and create a pattern\n\n" +
            "Press play to watch the pattern evolve";
        var textBStr = "" +
            "Rules: \n\n" +
            "\t1. Any live cell with 2 or 3 live neighbors survives\n\n" +
            "\t2. Any dead cell with three live neighbors becomes a live cell\n\n" +
            "\t3. All other live cells die. Similarly, all other dead cells stay dead";
        var textA = _this.scene.add.bitmapText(30 - xOffset, 100 - yOffset, 'arcade', textAStr, 14);
        var textB = _this.scene.add.bitmapText(30 - xOffset, 200 - yOffset, 'arcade', textBStr, 8);
        _this.add([window, xButton, textA, textB])
            .setSize(window.width, window.height)
            .setDisplaySize(window.width, window.height)
            .setVisible(false)
            .setInteractive();
        _this.scene.input.setDraggable(_this);
        _this.on(Phaser.Input.Events.GAMEOBJECT_DRAG, function (pointer, dragX, dragY) {
            this.x = dragX;
            this.y = dragY;
        }, _this);
        return _this;
    }
    return InfoContainer;
}(Phaser.GameObjects.Container));
exports.InfoContainer = InfoContainer;
