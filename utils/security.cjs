const crypto = require("crypto");

class SecurityManager {
  constructor(config) {
    const defaultConfig = {
      encryptionEnabled: true,
      encryptionKey: null,
    };
    this.config = { ...defaultConfig, ...config };
    this.encryptionKey = this.config.encryptionKey
      ? this.generateKey(this.config.encryptionKey)
      : crypto.randomBytes(32);
    this.enabled = this.config.encryptionEnabled;
  }

  generateKey(seed) {
    if (seed) {
      const salt = crypto.randomBytes(16);
      return crypto.scryptSync(seed, salt, 32);
    }
    return crypto.randomBytes(32);
  }

  encrypt(data) {
    if (!this.enabled || !data) {
      return data;
    }

    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        this.encryptionKey,
        iv
      );
      let encrypted = cipher.update(data, "utf8", "hex");
      encrypted += cipher.final("hex");
      return iv.toString("hex") + ":" + encrypted;
    } catch (error) {
      console.error("Encryption failed:", error);
      return data;
    }
  }

  decrypt(encryptedData) {
    if (!this.enabled || !encryptedData) {
      return encryptedData;
    }

    try {
      const parts = encryptedData.split(":");
      if (parts.length !== 2) {
        return encryptedData;
      }

      const [ivHex, encryptedHex] = parts;
      const iv = Buffer.from(ivHex, "hex");
      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        this.encryptionKey,
        iv
      );
      let decrypted = decipher.update(encryptedHex, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (error) {
      console.error("Decryption failed:", error);
      return encryptedData;
    }
  }

  sanitizeInput(input) {
    if (!input) return input;
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .trim();
  }

  hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return salt + ":" + hash;
  }

  verifyPassword(password, stored) {
    const [salt, hash] = stored.split(":");
    const verify = crypto.scryptSync(password, salt, 64).toString("hex");
    return hash === verify;
  }

  generateSecureId() {
    return crypto.randomBytes(16).toString("hex");
  }
}

module.exports = { SecurityManager };

module.exports.securityManagerInstance = new SecurityManager();

module.exports.getSecurityManager = (config) => {
  return new SecurityManager(config);
};
