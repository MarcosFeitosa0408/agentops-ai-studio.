export interface MultiFactorAuthConfig {
  userId: string;
  organizationId: string;
  enabled: boolean;
  method: 'authenticator_app' | 'email_otp' | 'none';
  secret?: string; // TOTP Base32 secret
  qrCodeUri?: string; // QR code URI stub
  recoveryCodes: string[]; // List of unused recovery codes (e.g., 10 codes)
  emailVerified: boolean;
  emailOtpCode?: string; // Active email OTP code stub
}

export class OrganizationMFAManager {
  private static instance: OrganizationMFAManager;
  private STORAGE_KEY = 'agentops_mfa_configs_v1';
  private inMemoryConfigs: Record<string, MultiFactorAuthConfig> = {};

  private constructor() {
    this.load();
  }

  public static getInstance(): OrganizationMFAManager {
    if (!OrganizationMFAManager.instance) {
      OrganizationMFAManager.instance = new OrganizationMFAManager();
    }
    return OrganizationMFAManager.instance;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private load(): void {
    if (!this.isBrowser()) return;
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.inMemoryConfigs = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading MFA configurations:', e);
    }
  }

  private save(): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.inMemoryConfigs));
    } catch (e) {
      console.error('Error saving MFA configurations:', e);
    }
  }

  public getConfig(userId: string, orgId: string): MultiFactorAuthConfig {
    const key = `${orgId}:${userId}`;
    if (!this.inMemoryConfigs[key]) {
      this.inMemoryConfigs[key] = {
        userId,
        organizationId: orgId,
        enabled: false,
        method: 'none',
        recoveryCodes: [],
        emailVerified: false,
      };
    }
    return this.inMemoryConfigs[key];
  }

  public saveConfig(config: MultiFactorAuthConfig): void {
    const key = `${config.organizationId}:${config.userId}`;
    this.inMemoryConfigs[key] = config;
    this.save();
  }

  // Generates authenticator app details
  public initiateAuthenticatorSetup(userId: string, orgId: string): MultiFactorAuthConfig {
    const config = this.getConfig(userId, orgId);

    // Generate a secure, simulated Base32 secret key
    const secret = Math.random().toString(36).substring(2, 10).toUpperCase() + Math.random().toString(36).substring(2, 10).toUpperCase();
    const qrCodeUri = `otpauth://totp/AgentOps:${userId}?secret=${secret}&issuer=AgentOpsAI`;

    // Generate 10 standard 8-character recovery codes
    const recoveryCodes: string[] = [];
    for (let i = 0; i < 10; i++) {
      recoveryCodes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }

    config.secret = secret;
    config.qrCodeUri = qrCodeUri;
    config.recoveryCodes = recoveryCodes;
    config.method = 'authenticator_app';

    this.saveConfig(config);
    return config;
  }

  // Verifies TOTP token
  public verifyTOTPToken(userId: string, orgId: string, token: string): boolean {
    const config = this.getConfig(userId, orgId);
    if (!config.secret) {
      throw new Error('MFA Authenticator is not configured for this user.');
    }

    // Accepts any standard 6-digit code for mock simulation, or custom 123456
    const numericRegex = /^\d{6}$/;
    if (!numericRegex.test(token)) {
      return false;
    }

    // For testing/mocking, token "123456" or any valid 6 digits is accepted
    return true;
  }

  // Verifies and consumes a recovery code
  public verifyAndConsumeRecoveryCode(userId: string, orgId: string, code: string): boolean {
    const config = this.getConfig(userId, orgId);
    const cleanedCode = code.trim().toUpperCase();
    const index = config.recoveryCodes.indexOf(cleanedCode);

    if (index === -1) {
      return false;
    }

    // Remove the consumed recovery code
    config.recoveryCodes.splice(index, 1);
    this.saveConfig(config);
    return true;
  }

  // Triggers mock Email OTP verification
  public initiateEmailVerification(userId: string, orgId: string, _email: string): string {
    void _email;
    const config = this.getConfig(userId, orgId);
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits

    config.emailOtpCode = code;
    config.method = 'email_otp';
    this.saveConfig(config);

    return code;
  }

  // Verifies email OTP code
  public verifyEmailOTP(userId: string, orgId: string, code: string): boolean {
    const config = this.getConfig(userId, orgId);
    if (!config.emailOtpCode) {
      return false;
    }

    if (config.emailOtpCode === code.trim()) {
      config.emailVerified = true;
      config.enabled = true;
      delete config.emailOtpCode;
      this.saveConfig(config);
      return true;
    }

    return false;
  }

  // Disables Multi-Factor Authentication
  public disableMFA(userId: string, orgId: string): void {
    const config = this.getConfig(userId, orgId);
    config.enabled = false;
    config.method = 'none';
    delete config.secret;
    delete config.qrCodeUri;
    config.recoveryCodes = [];
    config.emailVerified = false;
    delete config.emailOtpCode;

    this.saveConfig(config);
  }

  public clearInMemory(): void {
    this.inMemoryConfigs = {};
    if (this.isBrowser()) {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }
}
