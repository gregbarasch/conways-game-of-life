export {}

declare module "phaser" {
    interface Scene {
        addButton(
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
        ): Phaser.GameObjects.Container
    }
}
