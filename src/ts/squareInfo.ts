export enum State {
    DEAD,
    ALIVE,
}

export class SquareInfo {

    public readonly xPixel: number
    public readonly yPixel: number
    public state: State
    // For convenience and to reduce garbage collection
    public neighbors: SquareInfo[]

    public constructor(xPixel: number, yPixel: number, state: State = State.DEAD) {
        this.xPixel = xPixel
        this.yPixel = yPixel
        this.state = state
    }

    public isAlive(): boolean {
        return this.state === State.ALIVE
    }

    // Dependent on neighbors var
    public getNextState(): State {
        const numLiveNeighbors = this.neighbors
            .filter(neighbor => neighbor.isAlive())
            .length

        // Here are the rule's of the game
        if (this.isAlive() && numLiveNeighbors >= 2 && numLiveNeighbors <= 3) {
            return State.ALIVE
        } else if (!this.isAlive() && numLiveNeighbors === 3) {
            return State.ALIVE
        } else {
            return State.DEAD
        }
    }
}
