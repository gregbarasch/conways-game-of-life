import "phaser"
import {GameScene} from "./game_scene"

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    width: 1280,
    height: 900
}

let game = new Phaser.Game(config)
game.scene.add(GameScene.NAME, new GameScene(config), true)
