import { describe, it, expect } from 'vitest';
import { AuthService, MOCK_USERS } from '@/lib/auth/authService';

describe('Auth Service Unit Tests', () => {
  it('should find user on valid login email', () => {
    const adminUser = MOCK_USERS.find(u => u.role === 'Admin');
    expect(adminUser).toBeDefined();

    const loggedIn = AuthService.login(adminUser!.email);
    expect(loggedIn).not.toBeNull();
    expect(loggedIn?.email).toBe(adminUser!.email);
  });

  it('should handle case-insensitive emails on login', () => {
    const adminUser = MOCK_USERS.find(u => u.role === 'Admin');
    expect(adminUser).toBeDefined();

    const loggedIn = AuthService.login(adminUser!.email.toUpperCase());
    expect(loggedIn).not.toBeNull();
    expect(loggedIn?.id).toBe(adminUser!.id);
  });

  it('should return null for invalid email login', () => {
    const loggedIn = AuthService.login('nonexistent@agentops.ai');
    expect(loggedIn).toBeNull();
  });

  it('should register a new user with default values', () => {
    const name = 'Alice Smith';
    const email = 'alice@agentops.ai';
    const role = 'AI Developer';

    const user = AuthService.register(name, email, role);
    expect(user.id).toBeDefined();
    expect(user.name).toBe(name);
    expect(user.email).toBe(email);
    expect(user.role).toBe(role);
    expect(user.avatar).toBe('AS');
    expect(user.workspaces).toContain('ws-engineering');
  });

  it('should generate a token prefix containing session information', () => {
    const user = MOCK_USERS[0];
    const token = AuthService.generateToken(user);

    expect(token).toContain('jwt_session_token_');
    const base64Data = token.replace('jwt_session_token_', '');
    const decoded = JSON.parse(atob(base64Data));

    expect(decoded.id).toBe(user.id);
    expect(decoded.r).toBe(user.role);
  });

  it('should securely mask and encrypt secrets', () => {
    const secret = 'super_secret_api_key_12345';
    const encrypted = AuthService.encryptSecret(secret);

    expect(encrypted).toContain('aes256_gcm_');
    const base64Data = encrypted.replace('aes256_gcm_', '');
    const decrypted = atob(base64Data);

    expect(decrypted).toContain('****');
    expect(decrypted.slice(0, 4)).toBe(secret.slice(0, 4));
    expect(decrypted.slice(-4)).toBe(secret.slice(-4));
  });

  it('should return empty string for empty secret encryption', () => {
    expect(AuthService.encryptSecret('')).toBe('');
  });
});
