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
): Phaser.GameObjects.Container {

    let btn = this.add.sprite(x, y, texture, outFrame).setOrigin(0)
    let myWidth = width != null ? width : btn.width
    let myHeight = height != null ? height : btn.height
    btn.setDisplaySize(myWidth, myHeight).setSize(myWidth, myHeight)

    let hitBox = new Phaser.Geom.Rectangle(x, y, width, height)
    let btnContainer = new Phaser.GameObjects.Container(this, x, y)
        .setInteractive(hitBox, (hitArea: any, x: number, y: number) => {
                return x >= 0
                    && x <= hitArea.width
                    && y >= 0
                    && y <= hitArea.height
            }
        )

    btnContainer.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function() {
        return this.setFrame(overFrame, false, false)
            .setDisplaySize(myWidth, myHeight)
            .setSize(myWidth, myHeight)
    }, btn)

    btnContainer.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT,  function() {
        return this.setFrame(outFrame, false, false)
            .setDisplaySize(myWidth, myHeight)
            .setSize(myWidth, myHeight)
    }, btn)

    btnContainer.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, function() {
        return this.setFrame(downFrame, false, false)
            .setDisplaySize(myWidth*0.8, myHeight*0.8)
            .setSize(myWidth*0.8, myHeight*0.8)
    }, btn)

    btnContainer.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, function() {
        this.setFrame(overFrame, false, false)
            .setDisplaySize(myWidth, myHeight)
            .setSize(myWidth, myHeight)
        callback.bind(callbackContext).call()
        return this
    }, btn)

    return btnContainer
}
