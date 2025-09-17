import { BaseStorage } from "../base";
import { STORAGE_KEYS } from "../types";
import type { GridConfiguration } from "./types";

/**
 * Grid configuration storage manager
 * Handles persistent storage of grid layout preferences
 */
export class GridConfigStorage extends BaseStorage {
  constructor() {
    super("ui");
  }

  /**
   * Get grid configuration with defaults
   */
  async getGridConfig(): Promise<{
    success: boolean;
    data?: GridConfiguration;
    error?: string;
  }> {
    const defaultConfig: GridConfiguration = {
      columns: 4,
      itemHeight: 80,
      gridGap: 5,
      itemSpacing: 8,
      containerPadding: 16,
      maxWidth: 400,
    };

    return await this.get(STORAGE_KEYS.UI_GRID_CONFIG, defaultConfig);
  }

  /**
   * Update grid configuration
   */
  async updateGridConfig(config: Partial<GridConfiguration>): Promise<boolean> {
    const current = await this.getGridConfig();

    if (!current.success || !current.data) {
      return false;
    }

    const updated: GridConfiguration = {
      ...current.data,
      ...config,
    };

    const result = await this.set(STORAGE_KEYS.UI_GRID_CONFIG, updated);
    return result.success;
  }

  /**
   * Reset grid configuration to defaults
   */
  async resetGridConfig(): Promise<boolean> {
    const result = await this.remove(STORAGE_KEYS.UI_GRID_CONFIG);
    return result.success;
  }
}

// Export singleton instance
export const gridConfigStorage = new GridConfigStorage();
