import { GameConfig } from '../types/config.types';
import rawConfig from '../../data/game-balance.json';

export class ConfigLoader {
  private static instance: GameConfig;

  static load(): GameConfig {
    if (!this.instance) {
      this.instance = rawConfig as GameConfig;
    }
    return this.instance;
  }
}
export const GAME_CONFIG = ConfigLoader.load();
