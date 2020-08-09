Phaser.Scene.prototype.addButton = function(
    x: number,
    y: number,
    callback: any,
    callbackContext: Phaser.Scene,
    texture: string,
    outFrame: string | integer,
    overFrame: string | integer,
    downFrame: string | integer,
    size?: number,
): Phaser.GameObjects.Sprite {

    let btn = this.add.sprite(x, y, texture, outFrame)
        .setOrigin(0)
        .setInteractive();

    let myWidth = btn.width
    let myHeight = btn.height
    if (size != undefined) {
        myWidth = size
        myHeight = size
    }
    btn.setSize(myWidth, myHeight)
    btn.setDisplaySize(myWidth, myHeight)

    btn.on(Phaser.Input.Events.POINTER_OVER, function() {
        this.setSize(myWidth, myHeight)
        this.setDisplaySize(myWidth, myHeight)
        this.setFrame(overFrame);
    });

    btn.on(Phaser.Input.Events.POINTER_OUT,  function() {
        this.setSize(myWidth, myHeight)
        this.setDisplaySize(myWidth, myHeight)
        this.setFrame(outFrame);
    });

    btn.on(Phaser.Input.Events.POINTER_DOWN, function() {
        this.setSize(myWidth*.8, myHeight*.8)
        this.setDisplaySize(myWidth*.8, myHeight*.8)
        this.setFrame(downFrame);
    });

    btn.on(Phaser.Input.Events.POINTER_UP, function() {
        this.setSize(myWidth, myHeight)
        this.setDisplaySize(myWidth, myHeight)
        this.setFrame(overFrame);
        callback.bind(callbackContext).call();
    });

    return btn;
};
