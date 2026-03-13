/* global localStorage */

import { PersistentStorage } from "./storage";
import { SimpleEncryption } from "./encryption";

/**
 * High-level API for managing encrypted API key storage
 * Handles migration from localStorage to roamingSettings
 * Provides fallback chain for safety
 */
export class ApiKeyStorage {
  private static readonly STORAGE_KEY = "apiKey";
  private static readonly MIGRATION_FLAG = "_apiKeyMigrated";

  private static getLocalStorageKey(): string {
    try {
      return localStorage.getItem(this.STORAGE_KEY) || "";
    } catch (error) {
      console.error("Could not read API key from localStorage:", error);
      return "";
    }
  }

  private static syncLocalCache(apiKey: string): void {
    if (!apiKey) {
      return;
    }

    try {
      if (localStorage.getItem(this.STORAGE_KEY) !== apiKey) {
        localStorage.setItem(this.STORAGE_KEY, apiKey);
      }
    } catch (error) {
      console.warn("Could not refresh API key localStorage cache:", error);
    }
  }

  /**
   * Get the API key
   * Fallback chain: roamingSettings (encrypted) → localStorage → empty string
   * @returns API key or empty string if not found
   */
  static async get(): Promise<string> {
    try {
      // First, try to get from roamingSettings (new storage)
      const encryptedKey = PersistentStorage.get(this.STORAGE_KEY);
      let roamingKeyNeedsRepair = false;

      if (encryptedKey) {
        // Decrypt and return
        const decryptedKey = await SimpleEncryption.decrypt(encryptedKey);
        if (decryptedKey && !SimpleEncryption.isEncrypted(decryptedKey)) {
          this.syncLocalCache(decryptedKey);
          return decryptedKey;
        }

        console.error("Failed to decrypt API key from roamingSettings. Falling back to localStorage cache.");
        roamingKeyNeedsRepair = true;
      }

      // Fallback to localStorage (old storage)
      const localKey = this.getLocalStorageKey();

      if (localKey) {
        if (roamingKeyNeedsRepair || !encryptedKey || !this.isMigrated()) {
          console.log("API key found in localStorage, migrating to roamingSettings...");
          // Auto-migrate from localStorage to roamingSettings
          await this.set(localKey);
        }

        return localKey;
      }

      // No key found
      return "";
    } catch (error) {
      console.error("Error getting API key:", error);

      // Ultimate fallback: try localStorage directly
      return this.getLocalStorageKey();
    }
  }

  /**
   * Save the API key (encrypted to roamingSettings, falls back to localStorage)
   * @param apiKey - API key to save
   * @returns Promise that resolves when save is complete
   */
  static async set(apiKey: string): Promise<void> {
    if (!apiKey) {
      throw new Error("API key cannot be empty");
    }

    let savedToRoamingSettings = false;

    // Try to save to roamingSettings first (encrypted)
    try {
      const encryptedKey = await SimpleEncryption.encrypt(apiKey);
      await PersistentStorage.set(this.STORAGE_KEY, encryptedKey);
      await PersistentStorage.set(this.MIGRATION_FLAG, "true");
      savedToRoamingSettings = true;
      console.log("API key saved successfully to roamingSettings (encrypted)");
    } catch (roamingError) {
      console.warn("Could not save to roamingSettings, falling back to localStorage:", roamingError);
      // Continue to localStorage fallback
    }

    // Always save to localStorage as backup (or primary if roamingSettings failed)
    try {
      localStorage.setItem(this.STORAGE_KEY, apiKey);
      if (!savedToRoamingSettings) {
        console.log("API key saved to localStorage (roamingSettings not available)");
      }
    } catch (localStorageError) {
      console.error("Could not save to localStorage:", localStorageError);
      // If both failed, throw error
      if (!savedToRoamingSettings) {
        throw new Error("Failed to save API key to any storage location");
      }
    }
  }

  /**
   * Remove the API key from all storage locations
   * @returns Promise that resolves when removal is complete
   */
  static async remove(): Promise<void> {
    try {
      // Remove from roamingSettings
      await PersistentStorage.remove(this.STORAGE_KEY);

      // Remove from localStorage
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch (localStorageError) {
        console.warn("Could not remove from localStorage:", localStorageError);
      }

      console.log("API key removed from all storage locations");
    } catch (error) {
      console.error("Error removing API key:", error);
      throw error;
    }
  }

  /**
   * Check if API key exists
   * @returns True if API key exists in any storage location
   */
  static async has(): Promise<boolean> {
    const key = await this.get();
    return key !== "";
  }

  /**
   * Check if migration has been completed
   * @returns True if API key has been migrated to roamingSettings
   */
  static isMigrated(): boolean {
    return PersistentStorage.has(this.MIGRATION_FLAG);
  }
}
