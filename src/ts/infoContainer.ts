import "./phaserExtensions"

/**
 * Informational window that opens when you click the "i" button
 */
export class InfoContainer extends Phaser.GameObjects.Container {

    public constructor(scene: Phaser.Scene, x?: number, y?: number, width?: number, height?: number) {
        super(scene, x, y)

        const myWidth = width !== undefined ? width : this.scene.game.canvas.width/2
        const myHeight = height !== undefined ? height : this.scene.game.canvas.height/2
        const xOffset = myWidth/2
        const yOffset = myHeight/2

        const window = this.scene.add.image(0,0, 'window')
            .setSize(myWidth, myHeight)
            .setDisplaySize(myWidth, myHeight)

        const xButtonSize = 50
        const xButton = this.scene.addButton(
            xOffset-xButtonSize, 0 - yOffset,
            ()=>this.setVisible(false), this,
            "buttons", "close", "close_active", "close_active",
            xButtonSize, xButtonSize)

        const textAStr = "" +
            "Click the tiles and create a pattern\n\n" +
            "Press play to watch the pattern evolve"
        const textBStr = "" +
            "Rules: \n\n" +
            "\t1. Any live cell with 2 or 3 live neighbors survives\n\n" +
            "\t2. Any dead cell with three live neighbors becomes a live cell\n\n" +
            "\t3. All other live cells die. Similarly, all other dead cells stay dead"

        const textA = this.scene.add.bitmapText(30 - xOffset, 100 - yOffset, 'arcade', textAStr, 14)
        const textB = this.scene.add.bitmapText(30 - xOffset, 200 - yOffset, 'arcade', textBStr, 8)

        this.add([window, xButton, textA, textB])
            .setSize(window.width, window.height)
            .setDisplaySize(window.width, window.height)
            .setVisible(false)
            .setInteractive()

        this.scene.input.setDraggable(this)
        this.on(Phaser.Input.Events.GAMEOBJECT_DRAG, function(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): any {
            this.x = dragX
            this.y = dragY
        }, this)
    }
}
