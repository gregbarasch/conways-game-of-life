export {}

declare module "phaser" {
    interface Scene {
        addButton(
            x: number,
            y: number,
            callback: any,
            callbackContext: Phaser.Scene,
            texture: string,
            outFrame: string | integer,
            overFrame: string | integer,
            downFrame: string | integer,
            size?: number,
        ): Phaser.GameObjects.Sprite
    }
}
