import type { GameCommand, UiState } from "../../types/game";

type StateListener = (state: UiState) => void;
type CommandListener = (command: GameCommand) => void;

export class GameBridge {
  private stateListeners = new Set<StateListener>();

  private commandListeners = new Set<CommandListener>();

  subscribeState(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  subscribeCommand(listener: CommandListener): () => void {
    this.commandListeners.add(listener);
    return () => this.commandListeners.delete(listener);
  }

  emitState(state: UiState): void {
    this.stateListeners.forEach((listener) => listener(state));
  }

  sendCommand(command: GameCommand): void {
    this.commandListeners.forEach((listener) => listener(command));
  }
}
