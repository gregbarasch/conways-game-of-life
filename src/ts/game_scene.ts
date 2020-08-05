export class GameScene extends Phaser.Scene {

    public static readonly NAME: string = "game_scene"

    private static readonly PURPLE = 0x5f0983
    private static readonly BLACK = 0x000000
    private static readonly X_NUM = 60
    private static readonly Y_NUM = 60

    private worldTexture: Phaser.GameObjects.RenderTexture
    private grid: SquareInfo[][]

    private purpleSquare: Phaser.GameObjects.Rectangle
    private blackSquare: Phaser.GameObjects.Rectangle
    private sqBorderThickness: number
    private sqWidth: number
    private sqHeight: number

    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        config.key = GameScene.NAME
        super(config)
        this.grid = []
    }

    preload() {
        this.worldTexture = this.add.renderTexture(0, 0, this.cameras.main.width, this.cameras.main.height).setInteractive()
        this.worldTexture.on(Phaser.Input.Events.POINTER_DOWN, function(pointer: Phaser.Input.Pointer) {
            this.toggleTile(pointer.worldX, pointer.worldY)
        }, this)

        // Based on verticle axis
        this.sqBorderThickness = Math.ceil(this.cameras.main.height / GameScene.X_NUM / 19)
        this.sqHeight = this.cameras.main.height / GameScene.Y_NUM
        this.sqWidth = this.cameras.main.width / GameScene.X_NUM

        this.purpleSquare = new Phaser.GameObjects.Rectangle(this, 0, 0, this.sqWidth, this.sqHeight)
            .setStrokeStyle(this.sqBorderThickness, GameScene.BLACK)
            .setFillStyle(GameScene.PURPLE)
        this.blackSquare = new Phaser.GameObjects.Rectangle(this, 0, 0, this.sqWidth, this.sqHeight)
            .setStrokeStyle(this.sqBorderThickness, GameScene.PURPLE)
            .setFillStyle(GameScene.BLACK)

        for (let y = 0; y < GameScene.Y_NUM; y++) {
            this.grid[y] = []
            for (let x = 0; x < GameScene.X_NUM; x++) {
                let xPixel = this.xPixelFromTile(x)
                let yPixel = this.yPixelFromTile(y)
                this.worldTexture.draw(this.blackSquare, xPixel, yPixel)
                this.grid[y][x] = new SquareInfo(xPixel, yPixel, GameScene.BLACK)
            }
        }
    }


    update(time: number, delta: number) {
        super.update(time, delta)
    }

    xTileFromPixel(xPixel: number): number {
        return Math.floor(xPixel/this.sqWidth)
    }

    xPixelFromTile(x: number): number {
        return this.sqWidth*x + this.sqWidth/2
    }

    yTileFromPixel(yPixel: number): number {
        return Math.floor(yPixel/this.sqHeight)
    }

    yPixelFromTile(y: number): number {
        return this.sqHeight*y + this.sqHeight/2
    }

    toggleTile(xPixel: number, yPixel: number) {
        let x = this.xTileFromPixel(xPixel)
        let y = this.yTileFromPixel(yPixel)
        let color = this.grid[y][x].color == GameScene.BLACK  ? GameScene.PURPLE : GameScene.BLACK
        let square = color == GameScene.BLACK ? this.blackSquare : this.purpleSquare

        console.log("y: " + y)
        console.log("yPix: " + yPixel)
        console.log("cam: " + this.cameras.main.height)

        let squareInfo = this.grid[y][x].setColor(color)
        this.worldTexture.draw(square, squareInfo.x, squareInfo.y)
    }
}

class SquareInfo {
    // These should be pixel locations, not tile numbers
    public readonly x: number
    public readonly y: number
    public color: number

    constructor(x: number, y: number, color: number) {
        this.x = x
        this.y = y
        this.color = color
    }

    setColor(color: number): SquareInfo {
        this.color = color
        return this
    }
}
