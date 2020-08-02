import 'phaser';
import {GameScene} from "./game_scene";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080
    },
};

let game = new Phaser.Game(config);
game.scene.add(GameScene.NAME, new GameScene(config));
game.scene.start(GameScene.NAME, config);
export = game;
