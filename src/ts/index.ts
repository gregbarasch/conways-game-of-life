import "phaser"
import {GameScene} from "./game_scene"
import {TitleScene} from "./title_scene";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "main",
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    width: 1280,
    height: 720
}

let game = new Phaser.Game(config)
game.scene.add(GameScene.NAME, new GameScene(config))
game.scene.add(TitleScene.NAME, new TitleScene(config), true)
