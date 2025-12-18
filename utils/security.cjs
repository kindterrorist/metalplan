const crypto = require("crypto");

class SecurityManager {
  constructor(config) {
    const defaultConfig = {
      encryptionEnabled: true,
      encryptionKey: "metalplans-default-key-change-me",
    };
    this.config = { ...defaultConfig, ...config };
    this.encryptionKey = this.generateKey(this.config.encryptionKey);
    this.enabled = this.config.encryptionEnabled;
  }

  generateKey(seed) {
    if (seed) {
      return crypto.scryptSync(seed, "salt", 32);
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

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePhoneNumber(phone) {
    const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/;
    return phoneRegex.test(phone);
  }

  hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  validatePassword(password) {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    );
  }

  generateSecureId() {
    return crypto.randomBytes(16).toString("hex");
  }

  validateSqlInjection(input) {
    const dangerousPatterns = [
      /(\b(union|select|insert|delete|update|drop|create|alter|exec|execute)\b)/i,
      /(;|--|\/\*|\*\/|xp_|sp_|sysobjects|syscolumns)/i,
      /('|")\s*(or|and)\s*('|")/i,
    ];
    return !dangerousPatterns.some((pattern) => pattern.test(input));
  }

  sanitizeDatabaseInput(input) {
    if (!input) return input;
    return input
      .replace(/'/g, "''")
      .replace(/;/g, "")
      .replace(/--/g, "")
      .replace(/\/\*/g, "")
      .replace(/\*\//g, "")
      .trim();
  }
}

// Export the class and create a default instance
module.exports = { SecurityManager };

// Create a default instance for easy use
module.exports.securityManagerInstance = new SecurityManager();

module.exports.getSecurityManager = (config) => {
  return new SecurityManager(config);
};
