import "./phaser_extensions"

import RenderTexture = Phaser.GameObjects.RenderTexture
import SettingsConfig = Phaser.Types.Scenes.SettingsConfig
import Rectangle = Phaser.GameObjects.Rectangle
import BaseSound = Phaser.Sound.BaseSound;

export class GameScene extends Phaser.Scene {

    public static readonly NAME: string = "game_scene"

    private static readonly ALIVE_COLOR = 0x6600ff
    private static readonly DEAD_COLOR = 0x000000
    private static readonly BORDER_COLOR = 0x2757C1

    // grid dimensions
    private static readonly X_NUM = 60
    private static readonly Y_NUM = 60
    // X axis has empty space on right hand side for buttons
    private static readonly GRID_X_SCALE = .90

    // update loop speed
    private static readonly UPDATE_MS = 500

    private worldTexture: RenderTexture
    private grid: SquareInfo[][]
    private blipSound: BaseSound

    // enables and disables our game ticks
    private running: boolean
    // slow down our update loop by keeping track of time elapsed
    private timer: number

    private aliveSquare: Rectangle
    private deadSquare: Rectangle
    private sqBorderThickness: number
    private sqWidth: number
    private sqHeight: number

    constructor(config: SettingsConfig) {
        config.key = GameScene.NAME
        super(config)
        this.grid = []
        this.running = false // FIXME inline this stuff? super needs to be called first
        this.timer = 0
    }

    preload() {
        this.load.multiatlas('buttons', 'img/buttons.json', 'img')
        this.load.audio('blip', 'snd/blip.wav', {instances: 1});

        // setup world
        this.worldTexture = this.add.renderTexture(0, 0, this.cameras.main.width*GameScene.GRID_X_SCALE, this.cameras.main.height)
            .setOrigin(0)
            .setInteractive()
        this.worldTexture.on(Phaser.Input.Events.POINTER_DOWN,
            (pointer: Phaser.Input.Pointer, x: number, y: number) => this.toggleTileByPixel(x, y), this)

        // setup square sizes
        this.sqBorderThickness = 1
        this.sqHeight = this.cameras.main.height / GameScene.Y_NUM
        this.sqWidth = (this.cameras.main.width / GameScene.X_NUM) * GameScene.GRID_X_SCALE

        // setup square paint brushes
        this.aliveSquare = new Rectangle(this, 0, 0, this.sqWidth, this.sqHeight)
            .setName(State[State.ALIVE])
            .setStrokeStyle(this.sqBorderThickness, GameScene.BORDER_COLOR)
            .setFillStyle(GameScene.ALIVE_COLOR)
            .setOrigin(0)
        this.deadSquare = new Rectangle(this, 0, 0, this.sqWidth, this.sqHeight)
            .setName(State[State.DEAD])
            .setStrokeStyle(this.sqBorderThickness, GameScene.BORDER_COLOR)
            .setFillStyle(GameScene.DEAD_COLOR)
            .setOrigin(0)

        this.reset()
    }

    create() {
        this.blipSound = this.sound.add("blip")

        this.addButton(
            this.cameras.main.width*GameScene.GRID_X_SCALE,
            0,
            ()=>this.running = true,
            this,
            "buttons", "play.png", "play_active.png", "play_active.png",
            this.cameras.main.width*(1-GameScene.GRID_X_SCALE)
        )
        this.addButton(
            this.cameras.main.width*GameScene.GRID_X_SCALE,
            this.cameras.main.width*(1-GameScene.GRID_X_SCALE),
            ()=>this.running = false,
            this,
            "buttons", "pause.png", "pause_active.png", "pause_active.png",
            this.cameras.main.width*(1-GameScene.GRID_X_SCALE)
        )
        this.addButton(
            this.cameras.main.width*GameScene.GRID_X_SCALE,
            this.cameras.main.width*(1-GameScene.GRID_X_SCALE)*2,
            ()=>this.reset(),
            this,
            "buttons", "replay.png", "replay_active.png", "replay_active.png",
            this.cameras.main.width*(1-GameScene.GRID_X_SCALE)
        )
        this.addButton(
            this.cameras.main.width*GameScene.GRID_X_SCALE,
            this.cameras.main.width*(1-GameScene.GRID_X_SCALE)*3,
            ()=>{},
            this,
            "buttons", "info.png", "info_active.png", "info_active.png",
            this.cameras.main.width*(1-GameScene.GRID_X_SCALE)
        )
    }

    update(time: number, delta: number) {
        if (this.running) {
            // keep track of time elapsed between update(...) calls via this.timer
            this.timer += delta

            // once enough time has elapsed, we run our code
            if (this.timer >= GameScene.UPDATE_MS) {

                // stage then apply the new state
                let changes: SquareInfo[] = this.stageTick()
                this.applyTick(changes)
                this.blipSound.play()

                // reduce our timer back below our threshold so that we can continue iteration
                do {
                    this.timer -= GameScene.UPDATE_MS
                } while (this.timer >= GameScene.UPDATE_MS)
            }
        }
    }

    xPixelFromTile(x: number): number {
        return Math.ceil(this.sqWidth*x)
    }

    yPixelFromTile(y: number): number {
        return Math.ceil(this.sqHeight*y)
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
        let square = this.grid[y][x].square.name == this.deadSquare.name  ? this.aliveSquare : this.deadSquare
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

    reset() {
        this.running = false

        // create initial board state
        for (let y = 0; y < GameScene.Y_NUM; y++) {
            this.grid[y] = []
            for (let x = 0; x < GameScene.X_NUM; x++) {
                let xPixel = this.xPixelFromTile(x)
                let yPixel = this.yPixelFromTile(y)
                this.worldTexture.draw(this.deadSquare, xPixel, yPixel)
                this.grid[y][x] = new SquareInfo(xPixel, yPixel, this.deadSquare)
            }
        }

        // One more loop to set neighbors (dependent on SquareInfo instantiation)
        for (let y = 0; y < GameScene.Y_NUM; y++) {
            for (let x = 0; x < GameScene.X_NUM; x++) {
                this.grid[y][x].neighbors = this.getNeighbors(x, y)
            }
        }
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
    public square: Rectangle
    public state: State
    // For convenience and to reduce garbage collection
    public neighbors: SquareInfo[]

    /**
     * @param x pixel location
     * @param y pixel location
     * @param square the brush to paint the RenderTexture with
     * @param state starting state of the square. Default is State.Dead
     */
    constructor(x: number, y: number, square: Rectangle, state: State = State.DEAD) {
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
