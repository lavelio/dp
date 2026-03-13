/* global Office */

/**
 * Persistent storage utility using Office.context.roamingSettings
 * Data stored here survives cache clears and syncs across devices
 *
 * Note: roamingSettings has a 32KB size limit per user
 */
export class PersistentStorage {
  /**
   * Check if Office.context.roamingSettings is available
   * @returns True if roamingSettings is available
   */
  private static isAvailable(): boolean {
    try {
      return (
        typeof Office !== "undefined" &&
        Office.context !== undefined &&
        Office.context.roamingSettings !== undefined
      );
    } catch {
      return false;
    }
  }

  /**
   * Save a value to roaming settings
   * @param key - Storage key
   * @param value - Value to store
   * @returns Promise that resolves when save is complete
   */
  static async set(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.isAvailable()) {
          console.error(`roamingSettings is not available while saving ${key}`);
          reject(
            new Error(
              "Office.context.roamingSettings is not available. Make sure the add-in is running in Outlook."
            )
          );
          return;
        }

        const settings = Office.context.roamingSettings;
        settings.set(key, value);

        // Must call saveAsync to persist changes to the server
        settings.saveAsync((asyncResult) => {
          if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
            console.log(`Successfully saved ${key} to roamingSettings`);
            resolve();
          } else {
            const errorMsg = asyncResult.error?.message || "Unknown error";
            console.error(`roamingSettings.saveAsync failed while saving ${key}:`, errorMsg);
            reject(new Error(`Failed to save ${key}: ${errorMsg}`));
          }
        });
      } catch (error) {
        console.error(`Error in PersistentStorage.set for ${key}:`, error);
        reject(error);
      }
    });
  }

  /**
   * Get a value from roaming settings
   * @param key - Storage key
   * @returns Value or null if not found
   */
  static get(key: string): string | null {
    try {
      if (!this.isAvailable()) {
        console.warn(`roamingSettings is not available while reading ${key}`);
        return null;
      }

      const settings = Office.context.roamingSettings;
      const value = settings.get(key);
      return value !== undefined && value !== null ? value : null;
    } catch (error) {
      console.error(`Error getting ${key} from roamingSettings:`, error);
      return null;
    }
  }

  /**
   * Remove a value from roaming settings
   * @param key - Storage key
   * @returns Promise that resolves when removal is complete
   */
  static async remove(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.isAvailable()) {
          console.error(`roamingSettings is not available while removing ${key}`);
          reject(
            new Error(
              "Office.context.roamingSettings is not available. Make sure the add-in is running in Outlook."
            )
          );
          return;
        }

        const settings = Office.context.roamingSettings;
        settings.remove(key);

        settings.saveAsync((asyncResult) => {
          if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
            console.log(`Successfully removed ${key} from roamingSettings`);
            resolve();
          } else {
            const errorMsg = asyncResult.error?.message || "Unknown error";
            console.error(`roamingSettings.saveAsync failed while removing ${key}:`, errorMsg);
            reject(new Error(`Failed to remove ${key}: ${errorMsg}`));
          }
        });
      } catch (error) {
        console.error(`Error in PersistentStorage.remove for ${key}:`, error);
        reject(error);
      }
    });
  }

  /**
   * Check if a key exists in roaming settings
   * @param key - Storage key
   * @returns True if key exists with a non-null value
   */
  static has(key: string): boolean {
    try {
      if (!this.isAvailable()) {
        console.warn(`roamingSettings is not available while checking ${key}`);
        return false;
      }

      const settings = Office.context.roamingSettings;
      const value = settings.get(key);
      return value !== undefined && value !== null;
    } catch (error) {
      console.error(`Error checking ${key} in roamingSettings:`, error);
      return false;
    }
  }
}
