export {}

declare module "phaser" {
    interface Scene {
        addButton(
            x: number,
            y: number,
            callback: any,
            callbackContext: Phaser.Scene,
            spritesheet: string,
            outFrame: string | integer,
            overFrame: string | integer,
            downFrame: string | integer,
        ): Phaser.GameObjects.Sprite
    }
}
