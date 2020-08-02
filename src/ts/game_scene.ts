export class GameScene extends Phaser.Scene {

    public static readonly NAME: string = "game_scene";
    private grid: Phaser.GameObjects.Grid;

    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    preload() {
        this.grid = this.add.grid(1000, 1000, 1000, 1000, 10, 10, 0xff0000, 0xff0000, 0xffffff)
    }
}
