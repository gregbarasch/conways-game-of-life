Phaser.Scene.prototype.addButton = function(
    x: number,
    y: number,
    callback: any,
    callbackContext: Phaser.Scene,
    spritesheet: string,
    outFrame: string | integer,
    overFrame: string | integer,
    downFrame: string | integer,
): Phaser.GameObjects.Sprite {

    let btn = this.add.sprite(x, y, spritesheet).setInteractive();

    btn.on(Phaser.Input.Events.POINTER_OVER, function() {
        this.setScale(1, 1);
        this.setFrame(overFrame);
    });

    btn.on(Phaser.Input.Events.POINTER_OUT,  function() {
        this.setScale(1, 1);
        this.setFrame(outFrame);
    });

    btn.on(Phaser.Input.Events.POINTER_DOWN, function() {
        this.setScale(0.8, 0.8);
        this.setFrame(downFrame);
    });

    btn.on(Phaser.Input.Events.POINTER_UP, function() {
        this.setScale(1, 1);
        this.setFrame(overFrame);
        callback.bind(callbackContext).call();
    });

    return btn;
};
