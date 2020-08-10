import "./phaser_extensions"

import RenderTexture = Phaser.GameObjects.RenderTexture
import SettingsConfig = Phaser.Types.Scenes.SettingsConfig
import Rectangle = Phaser.GameObjects.Rectangle
import BaseSound = Phaser.Sound.BaseSound
import InfoContainer from "./info_container";
import {Game} from "phaser";
import Sprite = Phaser.GameObjects.Sprite;

export class GameScene extends Phaser.Scene {

    public static readonly NAME: string = "game_scene"

    private static readonly ALIVE_COLOR = 0x6600ff
    private static readonly DEAD_COLOR = 0x000000
    private static readonly BORDER_COLOR = 0x2757C1

    // grid dimensions
    // Chose factors of canvas width*X_SCALE and canvas height in order to handle rounding issues
    private static readonly X_NUM = 76
    private static readonly Y_NUM = 72
    // X axis has empty space on right hand side for buttons
    private static readonly GRID_X_SCALE = .95

    // update loop speed
    private static readonly UPDATE_MS = 500

    private worldTexture: RenderTexture
    private grid: SquareInfo[][] = []
    private infoContainer: InfoContainer
    private music: BaseSound
    private playButton: Sprite
    private pauseButton: Sprite

    // enables and disables our game ticks
    private running: boolean = false
    // slow down our update loop by keeping track of time elapsed
    private timer: number = 0

    private aliveSquare: Rectangle
    private deadSquare: Rectangle
    private sqBorderThickness: number
    private sqWidth: number
    private sqHeight: number
    private gridWidth: number
    private gridHeight: number

    constructor() {
        super(GameScene.NAME)
    }

    preload() {
        // setup sizes
        this.sqBorderThickness = 1
        this.gridHeight = this.game.canvas.height
        this.gridWidth = Math.floor(this.game.canvas.width * GameScene.GRID_X_SCALE)
        this.sqHeight = this.gridHeight / GameScene.Y_NUM
        this.sqWidth = this.gridWidth / GameScene.X_NUM

        // setup world
        this.worldTexture = this.add.renderTexture(0, 0, this.gridWidth, this.gridHeight)
            .setOrigin(0)
            .setInteractive()
        this.worldTexture.on(Phaser.Input.Events.POINTER_DOWN,
            (pointer: Phaser.Input.Pointer, x: number, y: number) => this.toggleTileByPixel(x, y), this)

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

        // new game
        this.resetGrid()
    }

    create() {
        this.music = this.sound.add('music', {loop: true})
        this.music.play()

        // Add my info popup window
        this.infoContainer = new InfoContainer(
            this,
            this.gridWidth/2,
            this.gridHeight/2,
            this.gridWidth/2,
            this.gridHeight/2
        )
        this.add.existing(this.infoContainer)

        // Add my UI buttons
        let x = this.gridWidth
        let buttonSize = this.game.canvas.width - this.gridWidth

        this.playButton = this.addButton(
            x, 0,
            ()=> {
                this.running = true
                this.playButton.setVisible(false)
                this.pauseButton.setVisible(true)
            }, this,
            "buttons", "play", "play_active", "play_active",
            buttonSize, buttonSize)

        this.pauseButton = this.addButton(
            x, 0,
            ()=> {
                this.running = false
                this.playButton.setVisible(true)
                this.pauseButton.setVisible(false)
            }, this,
            "buttons", "pause", "pause_active", "pause_active",
            buttonSize, buttonSize
        ).setVisible(false)

        this.addButton(
            x, buttonSize,
            ()=> {
                this.running = false
                this.playButton.setVisible(true)
                this.pauseButton.setVisible(false)
                this.resetGrid()
            }, this,
            "buttons", "replay", "replay_active", "replay_active",
            buttonSize, buttonSize)

        this.addButton(
            x, this.gridHeight-buttonSize*2,
            ()=>this.infoContainer.setVisible(!this.infoContainer.visible), this,
            "buttons", "info", "info_active", "info_active",
            buttonSize, buttonSize)

        this.addButton(
            x, this.gridHeight-buttonSize,
            ()=> this.game.sound.mute = !this.game.sound.mute, this,
            "buttons", "sound", "sound_active", "sound_active",
            buttonSize, buttonSize)
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
        let squareInfo = this.grid[y][x]

        let square
        if (squareInfo.isAlive()) {
            squareInfo.state = State.DEAD
            square = this.deadSquare
        } else {
            squareInfo.state = State.ALIVE
            square = this.aliveSquare
        }

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

    resetGrid() {
        // create initial board state
        for (let y = 0; y < GameScene.Y_NUM; y++) {
            this.grid[y] = []
            for (let x = 0; x < GameScene.X_NUM; x++) {
                let xPixel = this.xPixelFromTile(x)
                let yPixel = this.yPixelFromTile(y)
                this.worldTexture.draw(this.deadSquare, xPixel, yPixel)
                this.grid[y][x] = new SquareInfo(xPixel, yPixel)
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
    public state: State
    // For convenience and to reduce garbage collection
    public neighbors: SquareInfo[]

    /**
     * @param x pixel location
     * @param y pixel location
     * @param state starting state of the square. Default is State.Dead
     */
    constructor(x: number, y: number, state: State = State.DEAD) {
        this.x = x
        this.y = y
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
