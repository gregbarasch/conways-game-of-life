export class GameScene extends Phaser.Scene {

    public static readonly NAME: string = "game_scene"

    private static readonly PURPLE = 0x6600ff
    private static readonly BLACK = 0x000000
    private static readonly BLUE = 0x3333ff
    // grid dimensions
    private static readonly X_NUM = 60
    private static readonly Y_NUM = 60
    // update loop speed
    private static readonly UPDATE_MS = 500

    private worldTexture: Phaser.GameObjects.RenderTexture
    private grid: SquareInfo[][]

    // enables and disables our game ticks
    private running: boolean
    // slow down our update loop by keeping track of time elapsed
    private timer: number

    private purpleSquare: Phaser.GameObjects.Rectangle
    private blackSquare: Phaser.GameObjects.Rectangle
    private sqBorderThickness: number
    private sqWidth: number
    private sqHeight: number

    // TODO fix this later.. click a button rather than press enter
    private enterKey: Phaser.Input.Keyboard.Key

    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        config.key = GameScene.NAME
        super(config)
        this.grid = []
        this.running = false // FIXME inline this stuff? super needs to be called first
        this.timer = 0
    }

    preload() {
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)

        // setup render texture and listen for clicks
        this.worldTexture = this.add.renderTexture(0, 0, this.cameras.main.width, this.cameras.main.height)
        this.worldTexture.setInteractive()
        this.worldTexture.on(Phaser.Input.Events.POINTER_DOWN, function(pointer: Phaser.Input.Pointer) {
            this.toggleTileByPixel(pointer.worldX, pointer.worldY)
        }, this)

        // thickness based on vertical axis
        this.sqBorderThickness = Math.ceil(this.cameras.main.height / GameScene.X_NUM / 19)
        this.sqHeight = this.cameras.main.height / GameScene.Y_NUM
        this.sqWidth = this.cameras.main.width / GameScene.X_NUM

        this.purpleSquare = new Phaser.GameObjects.Rectangle(this, 0, 0, this.sqWidth, this.sqHeight)
            .setName("purple")
            .setStrokeStyle(this.sqBorderThickness, GameScene.BLUE)
            .setFillStyle(GameScene.PURPLE)
        this.blackSquare = new Phaser.GameObjects.Rectangle(this, 0, 0, this.sqWidth, this.sqHeight)
            .setName("black")
            .setStrokeStyle(this.sqBorderThickness, GameScene.BLUE)
            .setFillStyle(GameScene.BLACK)

        // Creates initial board state
        for (let y = 0; y < GameScene.Y_NUM; y++) {
            this.grid[y] = []
            for (let x = 0; x < GameScene.X_NUM; x++) {
                let xPixel = this.xPixelFromTile(x)
                let yPixel = this.yPixelFromTile(y)
                this.worldTexture.draw(this.blackSquare, xPixel, yPixel)
                this.grid[y][x] = new SquareInfo(xPixel, yPixel, this.blackSquare)
            }
        }

        // One more loop to set neighbors (dependent on SquareInfo instantiation)
        for (let y = 0; y < GameScene.Y_NUM; y++) {
            for (let x = 0; x < GameScene.X_NUM; x++) {
                this.grid[y][x].neighbors = this.getNeighbors(x, y)
            }
        }
    }

    update(time: number, delta: number) {
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.running = !this.running
        }

        if (this.running) {
            // keep track of time elapsed between update(...) calls via this.timer
            this.timer += delta

            // once enough time has elapsed, we run our code
            if (this.timer >= GameScene.UPDATE_MS) {

                // stage then apply the new state
                let changes: SquareInfo[] = this.stageTick()
                this.applyTick(changes)

                // reduce our timer back below our threshold so that we can continue iteration
                do {
                    this.timer -= GameScene.UPDATE_MS
                } while (this.timer >= GameScene.UPDATE_MS)
            }
        }
    }

    xPixelFromTile(x: number): number {
        return this.sqWidth*x + this.sqWidth/2
    }

    yPixelFromTile(y: number): number {
        return this.sqHeight*y + this.sqHeight/2
    }

    xTileFromPixel(xPixel: number): number {
        return Math.floor(xPixel/this.sqWidth)
    }

    yTileFromPixel(yPixel: number): number {
        return Math.floor(yPixel/this.sqHeight)
    }

    toggleTileByPixel(xPixel: number, yPixel: number) {
        let x = this.xTileFromPixel(xPixel)
        let y = this.yTileFromPixel(yPixel)
        this.toggleTile(x, y)
    }

    toggleTile(x: number, y: number) {
        let square = this.grid[y][x].square.name == this.blackSquare.name  ? this.purpleSquare : this.blackSquare
        let squareInfo = this.grid[y][x]
        squareInfo.square = square
        squareInfo.state = squareInfo.isAlive() ? State.DEAD : State.ALIVE
        this.worldTexture.draw(square, squareInfo.x, squareInfo.y)
    }

    getNeighbors(x: number, y: number): SquareInfo[] {
        let neighbors: SquareInfo[] = []

        let startX = (x-1 < 0) ? x : x-1;
        let startY = (y-1 < 0) ? y : y-1;
        let endX   = (x+1 >= GameScene.X_NUM) ? x : x+1;
        let endY   = (y+1 >= GameScene.Y_NUM) ? y : y+1;

        for (let row=startY; row<=endY; row++) {
            for (let col=startX; col<=endX; col++) {
                if (y != row || x != col) {
                    neighbors.push(this.grid[row][col])
                }
            }
        }

        return neighbors
    }

    // TODO if nothing changed state (emtpy return arr), game over
    stageTick(): SquareInfo[] {
        let changed: SquareInfo[] = []
        this.grid.forEach(row => row.forEach(square => {
            if (square.state != square.getNextState()) {
                changed.push(square)
            }
        }))
        return changed
    }

    applyTick(changes: SquareInfo[]) {
        changes.forEach(square => {
            this.toggleTileByPixel(square.x, square.y)
        })
    }
}

enum State {
    DEAD,
    ALIVE,
}

class SquareInfo {

    // These should be pixel origin locations, not tile numbers
    public readonly x: number
    public readonly y: number
    public square: Phaser.GameObjects.Rectangle
    public state: State
    // For convenience and to reduce garbage collection
    public neighbors: SquareInfo[]

    /**
     * @param x pixel location
     * @param y pixel location
     * @param square the brush to paint the RenderTexture with
     * @param state starting state of the square. Default is State.Dead
     */
    constructor(x: number, y: number, square: Phaser.GameObjects.Rectangle, state: State = State.DEAD) {
        this.x = x
        this.y = y
        this.square = square
        this.state = state
    }

    isAlive(): boolean {
        return this.state == State.ALIVE
    }

    getNextState(): State {
        let numLiveNeighbors = this.neighbors
            .filter(neighbor => neighbor.isAlive())
            .length

        // Here are the rule's of the game
        if (this.isAlive() && numLiveNeighbors >= 2 && numLiveNeighbors <= 3) {
            return State.ALIVE
        } else if (!this.isAlive() && numLiveNeighbors == 3) {
            return State.ALIVE
        } else {
            return State.DEAD
        }
    }
}
