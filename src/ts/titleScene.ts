import {GameScene} from "./gameScene"

export class TitleScene extends Phaser.Scene {

    public static readonly NAME: string = "title_scene"

    public constructor() {
        super(TitleScene.NAME)
    }

    public preload(): void {
        this.load.image('title_screen', 'img/title_screen.png')
        this.load.audio('coin', 'snd/coin_grab.wav')

        // hijacking title screen to work as bootloader for other assets
        this.load.multiatlas('buttons', 'img/buttons.json', 'img')
        this.load.audio('music', 'snd/crazy_games__wake_up.mp3', {instances: 1})
        this.load.image('window', 'img/window.png')
        this.load.bitmapFont('arcade', 'font/arcade.png', 'font/arcade.xml')
    }

    public create(): void {
        const coinSound = this.sound.add('coin')

        this.cameras.main.fadeIn(4000)
        this.add.image(this.cameras.main.width/2, this.cameras.main.height/2, 'title_screen')

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, (cam, effect) => {
            coinSound.play()
            this.time.delayedCall(1500, () => {
                this.cameras.main.fadeOut(2000)
            })
        })

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            this.scene.start(GameScene.NAME)
        })
    }
}
