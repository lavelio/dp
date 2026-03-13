/* global crypto, Office, TextEncoder, TextDecoder, btoa, atob */

/**
 * Simple encryption utilities using Web Crypto API
 * Provides defense-in-depth security for sensitive data storage
 */
export class SimpleEncryption {
  private static readonly KEY_PREFIX = "enc_";
  private static readonly ALGORITHM = "AES-GCM";
  private static readonly IV_LENGTH = 12;
  private static readonly KEY_LENGTH = 256;

  /**
   * Generate a consistent encryption key based on user identity
   * Uses Office user ID to ensure consistent key across sessions
   */
  private static async deriveKey(): Promise<CryptoKey> {
    // Use Office user identity as seed for key derivation
    // This ensures the same key is generated across sessions for the same user
    let userIdentity: string;

    try {
      // Try to get Office user ID for consistent key generation
      userIdentity = Office.context.mailbox?.userProfile?.emailAddress || "default-user";
    } catch {
      // Fallback if Office context not available
      userIdentity = "default-user";
    }

    // Add a static salt for additional security
    const salt = "digitales-postfach-v1";
    const keyMaterial = userIdentity + salt;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(keyMaterial);

    // Create a hash of the key material to get consistent 256-bit key
    const hashBuffer = await crypto.subtle.digest("SHA-256", keyData);

    // Import the hash as a key
    return await crypto.subtle.importKey("raw", hashBuffer, { name: this.ALGORITHM }, false, ["encrypt", "decrypt"]);
  }

  /**
   * Encrypt a text string
   * @param text - Plain text to encrypt
   * @returns Encrypted text with prefix, or original text if encryption fails
   */
  static async encrypt(text: string): Promise<string> {
    try {
      if (!text) return text;

      const encoder = new TextEncoder();
      const data = encoder.encode(text);

      // Derive encryption key
      const key = await this.deriveKey();

      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

      // Encrypt the data
      const encrypted = await crypto.subtle.encrypt({ name: this.ALGORITHM, iv }, key, data);

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Convert to base64 and add prefix
      return this.KEY_PREFIX + btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error("Encryption error:", error);
      // Return original text if encryption fails (graceful degradation)
      return text;
    }
  }

  /**
   * Decrypt an encrypted text string
   * @param encryptedText - Encrypted text with prefix
   * @returns Decrypted plain text, or original text if not encrypted/decryption fails
   */
  static async decrypt(encryptedText: string): Promise<string> {
    try {
      if (!encryptedText) return encryptedText;

      // Check if text is encrypted
      if (!encryptedText.startsWith(this.KEY_PREFIX)) {
        // Not encrypted - return as-is (backward compatibility)
        return encryptedText;
      }

      // Remove prefix and decode from base64
      const base64 = encryptedText.slice(this.KEY_PREFIX.length);
      const combined = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      // Extract IV and encrypted data
      const iv = combined.slice(0, this.IV_LENGTH);
      const data = combined.slice(this.IV_LENGTH);

      // Derive decryption key
      const key = await this.deriveKey();

      // Decrypt the data
      const decrypted = await crypto.subtle.decrypt({ name: this.ALGORITHM, iv }, key, data);

      // Convert back to string
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error("Decryption error:", error);
      // Return original text if decryption fails (graceful degradation)
      return encryptedText;
    }
  }

  /**
   * Check if a string is encrypted
   * @param text - Text to check
   * @returns True if text appears to be encrypted
   */
  static isEncrypted(text: string): boolean {
    return text ? text.startsWith(this.KEY_PREFIX) : false;
  }
}
