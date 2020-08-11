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

    let tint = 0x707070

    let btn = this.add.sprite(x, y, texture, outFrame)
    let myWidth = width != null ? width : btn.width
    let myHeight = height != null ? height : btn.height

    return btn.setDisplaySize(myWidth, myHeight)
        .setOrigin(0)
        .setInteractive()
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function() {
            return this.setFrame(overFrame, false, false).clearTint()
        }).on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT,  function() {
            return this.setFrame(outFrame, false, false).clearTint()
        }).on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, function() {
            return this.setFrame(downFrame, false, false).setTint(tint)
        }).on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, function() {
            this.setFrame(overFrame, false, false).clearTint()
            callback.bind(callbackContext).call()
            return this
        })
}
