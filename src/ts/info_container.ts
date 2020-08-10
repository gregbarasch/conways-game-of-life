import "./phaser_extensions"

/**
 * Informational window that opens when you click the "i" button
 */
export default class InfoContainer extends Phaser.GameObjects.Container {

    public constructor(scene: Phaser.Scene, x?: number, y?: number, width?: number, height?: number) {
        super(scene, x, y)

        let myWidth = width != undefined ? width : this.scene.game.canvas.width/2
        let myHeight = height != undefined ? height : this.scene.game.canvas.height/2
        let xOffset = myWidth/2
        let yOffset = myHeight/2

        let window = this.scene.add.image(0,0, 'window')
            .setSize(myWidth, myHeight)
            .setDisplaySize(myWidth, myHeight)

        let xButtonSize = 50
        let xButton = this.scene.addButton(
            xOffset-xButtonSize, 0 - yOffset,
            ()=>this.setVisible(false), this,
            "buttons", "close", "close_active", "close_active",
            xButtonSize, xButtonSize)

        let textAStr = "" +
            "Click the tiles and create a pattern\n\n" +
            "Press play to watch the pattern evolve"
        let textBStr = "" +
            "Rules: \n\n" +
            "\t1. Any live cell with 2 or 3 live neighbors survives\n\n" +
            "\t2. Any dead cell with three live neighbors becomes a live cell\n\n" +
            "\t3. All other live cells die. Similarly, all other dead cells stay dead"

        let textA = this.scene.add.bitmapText(30 - xOffset, 100 - yOffset, 'arcade', textAStr, 14)
        let textB = this.scene.add.bitmapText(30 - xOffset, 200 - yOffset, 'arcade', textBStr, 8)

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
