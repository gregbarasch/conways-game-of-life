Phaser.Scene.prototype.addButton = function(
    x: number,
    y: number,
    callback: any,
    callbackContext: any,
    texture: string,
    outFrame: string | integer,
    overFrame: string | integer,
    downFrame: string | integer,
    width?: number,
    height?: number,
): Phaser.GameObjects.Sprite {

    let btn = this.add.sprite(x, y, texture, outFrame)
        .setOrigin(0)
        .setInteractive()

    let myWidth = width != null ? width : btn.width
    let myHeight = height != null ? height : btn.height
    btn.setSize(myWidth, myHeight)
    btn.setDisplaySize(myWidth, myHeight)

    btn.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function() {
        this.setDisplaySize(myWidth, myHeight)
        this.setFrame(overFrame)
    })

    btn.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT,  function() {
        this.setDisplaySize(myWidth, myHeight)
        this.setFrame(outFrame)
    })

    btn.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, function() {
        this.setDisplaySize(myWidth*.8, myHeight*.8)
        this.setFrame(downFrame)
    })

    btn.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, function() {
        this.setDisplaySize(myWidth, myHeight)
        this.setFrame(overFrame)
        callback.bind(callbackContext).call()
    })

    return btn
}
