import "./phaserExtensions"
import {InfoContainer} from "./infoContainer"
import {SquareInfo} from "./squareInfo"
import {State} from "./squareInfo"

import RenderTexture = Phaser.GameObjects.RenderTexture
import Rectangle = Phaser.GameObjects.Rectangle
import BaseSound = Phaser.Sound.BaseSound
import Sprite = Phaser.GameObjects.Sprite

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

    public constructor() {
        super(GameScene.NAME)
    }

    public preload(): void {
        // setup sizes
        // Some small adjustments for strange rendering issues
        this.sqBorderThickness = 1
        this.gridHeight = this.game.canvas.height
        this.gridWidth = this.game.canvas.width * GameScene.GRID_X_SCALE
        this.sqHeight = (this.game.canvas.height-2) / GameScene.Y_NUM
        this.sqWidth = (this.game.canvas.width-2) * GameScene.GRID_X_SCALE / GameScene.X_NUM

        // setup world
        this.worldTexture = this.add.renderTexture(0, 0, this.gridWidth, this.gridHeight)
            .setOrigin(0)
            .setInteractive()
            .on(Phaser.Input.Events.POINTER_DOWN,
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
        // create initial board state
        for (let y = 0; y < GameScene.Y_NUM; y++) {
            this.grid[y] = []
            for (let x = 0; x < GameScene.X_NUM; x++) {
                const xPixel = this.xPixelFromTile(x)
                const yPixel = this.yPixelFromTile(y)
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

    public create(): void {
        this.music = this.sound.add('music', { loop: true })
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
        const x = this.gridWidth
        const buttonSize = this.game.canvas.width - this.gridWidth

        this.playButton = this.addButton(
            x, 0,
            ()=> {
                this.running = true
                this.playButton.setVisible(false)
                this.playButton.disableInteractive()
                this.pauseButton.setVisible(true)
                this.pauseButton.setInteractive()
            }, this,
            "buttons", "play", "play_active", "play_active",
            buttonSize, buttonSize)

        this.pauseButton = this.addButton(
            x, 0,
            ()=> {
                this.running = false
                this.playButton.setVisible(true)
                this.playButton.setInteractive()
                this.pauseButton.setVisible(false)
                this.pauseButton.disableInteractive()
            }, this,
            "buttons", "pause", "pause_active", "pause_active",
            buttonSize, buttonSize
        ).setVisible(false)

        this.addButton(
            x, buttonSize,
            ()=> {
                this.running = false
                this.playButton.setVisible(true)
                this.playButton.setInteractive()
                this.pauseButton.setVisible(false)
                this.pauseButton.disableInteractive()
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

    public update(time: number, delta: number): void {
        if (this.running) {
            // keep track of time elapsed between update(...) calls via this.timer
            this.timer += delta

            // once enough time has elapsed, we run our code
            if (this.timer >= GameScene.UPDATE_MS) {

                // stage then apply the new state
                const changes: SquareInfo[] = this.stageTick()
                this.applyTick(changes)

                // reduce our timer back below our threshold so that we can continue iteration
                do {
                    this.timer -= GameScene.UPDATE_MS
                } while (this.timer >= GameScene.UPDATE_MS)
            }
        }
    }

    // This might need to be fixed in the future, but +1 was for seemingly off by 1 error in rendering
    private xPixelFromTile(x: number): number {
        return (this.sqWidth*x)+1
    }

    private yPixelFromTile(y: number): number {
        return (this.sqHeight*y)+1
    }

    private xTileFromPixel(xPixel: number): number {
        return Math.floor(xPixel/this.sqWidth)
    }

    private yTileFromPixel(yPixel: number): number {
        return Math.floor(yPixel/this.sqHeight)
    }

    private toggleTileByPixel(xPixel: number, yPixel: number): void {
        const x = this.xTileFromPixel(xPixel)
        const y = this.yTileFromPixel(yPixel)
        this.toggleTile(x, y)
    }

    private toggleTile(x: number, y: number): void {
        const squareInfo = this.grid[y][x]

        let square
        if (squareInfo.isAlive()) {
            squareInfo.state = State.DEAD
            square = this.deadSquare
        } else {
            squareInfo.state = State.ALIVE
            square = this.aliveSquare
        }

        this.worldTexture.draw(square, squareInfo.xPixel, squareInfo.yPixel)
    }

    private getNeighbors(x: number, y: number): SquareInfo[] {
        const neighbors: SquareInfo[] = []

        const startX = (x-1 < 0) ? x : x-1
        const startY = (y-1 < 0) ? y : y-1
        const endX   = (x+1 >= GameScene.X_NUM) ? x : x+1
        const endY   = (y+1 >= GameScene.Y_NUM) ? y : y+1

        for (let row=startY; row<=endY; row++) {
            for (let col=startX; col<=endX; col++) {
                if (y !== row || x !== col) {
                    neighbors.push(this.grid[row][col])
                }
            }
        }

        return neighbors
    }

    private stageTick(): SquareInfo[] {
        const changed: SquareInfo[] = []
        this.grid.forEach(row => row.forEach(square => {
            if (square.state !== square.getNextState()) {
                changed.push(square)
            }
        }))
        return changed
    }

    private applyTick(changes: SquareInfo[]): void {
        changes.forEach(square => {
            this.toggleTileByPixel(square.xPixel, square.yPixel)
        })
    }

    private resetGrid(): void {
        this.grid.forEach(row => row.forEach(square => {
            if (square.isAlive()) {
                square.state = State.DEAD
                this.worldTexture.draw(this.deadSquare, square.xPixel, square.yPixel)
            }
        }))
    }
}
