import "phaser"
import {GameScene} from "./gameScene"
import {TitleScene} from "./titleScene"

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

const game = new Phaser.Game(config)
game.scene.add(GameScene.NAME, new GameScene())
game.scene.add(TitleScene.NAME, new TitleScene(), true)
