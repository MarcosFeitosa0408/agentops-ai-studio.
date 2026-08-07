import { describe, it, expect, beforeEach } from 'vitest';
import { OrganizationIdentityManager } from '@/organizations/OrganizationIdentity';
import { OrganizationSSOManager } from '@/organizations/OrganizationSSO';
import { OrganizationApiKeysManager } from '@/organizations/OrganizationApiKeys';
import { OrganizationSessionsManager } from '@/organizations/OrganizationSessions';
import { OrganizationMFAManager } from '@/organizations/OrganizationMFA';
import { OrganizationAuditPoliciesManager } from '@/organizations/OrganizationAuditPolicies';

describe('Enterprise Identity & Authentication (Module 4)', () => {
  const orgId = 'org-test-identity-123';
  const userId = 'user-test-identity-456';

  beforeEach(() => {
    OrganizationIdentityManager.getInstance().clearInMemory();
    OrganizationSSOManager.getInstance().clearInMemory();
    OrganizationApiKeysManager.getInstance().clearInMemory();
    OrganizationSessionsManager.getInstance().clearInMemory();
    OrganizationMFAManager.getInstance().clearInMemory();
    OrganizationAuditPoliciesManager.getInstance().clearInMemory();
  });

  describe('OrganizationIdentityManager (Profile management)', () => {
    it('should create, list and delete user identity profiles within organization', () => {
      const profile = OrganizationIdentityManager.getInstance().upsertProfile({
        userId,
        organizationId: orgId,
        employeeId: 'EMP-9988',
        department: 'Engineering',
        title: 'Principal Architect',
        domainVerified: true,
        status: 'Active',
      });

      expect(profile.employeeId).toBe('EMP-9988');
      expect(profile.department).toBe('Engineering');
      expect(profile.domainVerified).toBe(true);

      const found = OrganizationIdentityManager.getInstance().getProfile(userId, orgId);
      expect(found).toBeDefined();
      expect(found?.title).toBe('Principal Architect');

      const listed = OrganizationIdentityManager.getInstance().listProfilesByOrg(orgId);
      expect(listed.length).toBe(1);

      const deleted = OrganizationIdentityManager.getInstance().deleteProfile(userId, orgId);
      expect(deleted).toBe(true);

      const listAfterDelete = OrganizationIdentityManager.getInstance().listProfilesByOrg(orgId);
      expect(listAfterDelete.length).toBe(0);
    });
  });

  describe('OrganizationSSOManager (Single Sign-On)', () => {
    it('should load default config and save updated values', () => {
      const config = OrganizationSSOManager.getInstance().getConfig(orgId);
      expect(config.enabled).toBe(false);

      config.enabled = true;
      config.allowedProviders = ['google', 'microsoft'];
      config.requireSSO = true;

      OrganizationSSOManager.getInstance().saveConfig(config);

      const reloaded = OrganizationSSOManager.getInstance().getConfig(orgId);
      expect(reloaded.enabled).toBe(true);
      expect(reloaded.requireSSO).toBe(true);
      expect(reloaded.allowedProviders).toContain('microsoft');
    });

    it('should successfully parse mock SAML Metadata XML files', () => {
      const mockXml = `
        <md:EntityDescriptor entityID="https://saml.provider.com/idp/endpoint">
          <md:SingleSignOnService Location="https://saml.provider.com/idp/sso" />
          <KeyDescriptor>
            <X509Certificate>
              MOCK_X509_CERTIFICATE_BODY_12345
            </X509Certificate>
          </KeyDescriptor>
        </md:EntityDescriptor>
      `;

      const settings = OrganizationSSOManager.getInstance().parseSAMLMetadata(mockXml);
      expect(settings.issuer).toBe('https://saml.provider.com/idp/endpoint');
      expect(settings.entryPoint).toBe('https://saml.provider.com/idp/sso');
      expect(settings.cert).toBe('MOCK_X509_CERTIFICATE_BODY_12345');
    });

    it('should reject invalid SAML XML documents', () => {
      const invalidXml = '<InvalidXml></InvalidXml>';
      expect(() => {
        OrganizationSSOManager.getInstance().parseSAMLMetadata(invalidXml);
      }).toThrow('Invalid SAML Metadata XML');
    });

    it('should simulate OpenID Connect configuration discovery successfully', async () => {
      const discoUrl = 'https://oidc.company.com';
      const result = await OrganizationSSOManager.getInstance().discoverOIDC(discoUrl);

      expect(result.discoveryUrl).toBe(discoUrl);
      expect(result.authorizationEndpoint).toBe('https://oidc.company.com/oauth/authorize');
      expect(result.tokenEndpoint).toBe('https://oidc.company.com/oauth/token');
    });

    it('should reject OIDC discovery URLs that lack protocol prefix', async () => {
      const invalidUrl = 'oidc.company.com';
      await expect(OrganizationSSOManager.getInstance().discoverOIDC(invalidUrl)).rejects.toThrow('Invalid discovery URL');
    });
  });

  describe('OrganizationApiKeysManager (Enterprise API keys)', () => {
    it('should generate API Keys and Personal Access Tokens with distinct prefixes', () => {
      const apiKey = OrganizationApiKeysManager.getInstance().createKey({
        name: 'CI Pipeline Key',
        userId,
        organizationId: orgId,
        scopes: ['read:workers'],
        isPat: false,
      });

      expect(apiKey.key.startsWith('ao_key_')).toBe(true);
      expect(apiKey.maskedKey.startsWith('ao_key_')).toBe(true);

      const pat = OrganizationApiKeysManager.getInstance().createKey({
        name: 'Personal User Key',
        userId,
        organizationId: orgId,
        scopes: ['admin:all'],
        isPat: true,
      });

      expect(pat.key.startsWith('ao_pat_')).toBe(true);
      expect(pat.maskedKey.startsWith('ao_pat_')).toBe(true);
    });

    it('should validate active API Keys, update lastUsedAt, and block revoked keys', () => {
      const apiKey = OrganizationApiKeysManager.getInstance().createKey({
        name: 'Deployment CLI',
        userId,
        organizationId: orgId,
        scopes: ['write:workflows'],
      });

      const validated = OrganizationApiKeysManager.getInstance().validateKey(apiKey.key);
      expect(validated.id).toBe(apiKey.id);
      expect(validated.lastUsedAt).toBeDefined();

      // Revoke and test validation failure
      OrganizationApiKeysManager.getInstance().revokeKey(apiKey.id);
      expect(() => {
        OrganizationApiKeysManager.getInstance().validateKey(apiKey.key);
      }).toThrow('API Key has been revoked.');
    });

    it('should correctly filter expired API keys', () => {
      const apiKey = OrganizationApiKeysManager.getInstance().createKey({
        name: 'Expired CLI',
        userId,
        organizationId: orgId,
        scopes: ['read:workers'],
        expiresInDays: -1, // Expired yesterday
      });

      expect(() => {
        OrganizationApiKeysManager.getInstance().validateKey(apiKey.key);
      }).toThrow('API Key has expired.');
    });
  });

  describe('OrganizationSessionsManager (Active Sessions)', () => {
    it('should register sessions, list them, toggle trust status, and trigger forced logouts', () => {
      const session = OrganizationSessionsManager.getInstance().createSession({
        userId,
        organizationId: orgId,
        ipAddress: '192.168.1.15',
        userAgent: 'Firefox Mac',
        deviceType: 'Desktop',
      });

      expect(session.status).toBe('Active');
      expect(session.trusted).toBe(false);

      const list = OrganizationSessionsManager.getInstance().listSessionsByOrg(orgId);
      expect(list.length).toBe(1);

      // Toggle trust
      const updated = OrganizationSessionsManager.getInstance().toggleTrustDevice(session.id, true);
      expect(updated.trusted).toBe(true);

      // Forced logout
      OrganizationSessionsManager.getInstance().revokeSession(session.id);
      const activeList = OrganizationSessionsManager.getInstance().listSessionsByOrg(orgId);
      expect(activeList.length).toBe(0);
    });
  });

  describe('OrganizationMFAManager (Multi-Factor Authentication)', () => {
    it('should generate TOTP secrets, pair authenticator, verify and consume recovery codes', () => {
      const config = OrganizationMFAManager.getInstance().getConfig(userId, orgId);
      expect(config.enabled).toBe(false);

      // Pair TOTP authenticator app
      const setup = OrganizationMFAManager.getInstance().initiateAuthenticatorSetup(userId, orgId);
      expect(setup.secret).toBeDefined();
      expect(setup.qrCodeUri).toContain('secret=');
      expect(setup.recoveryCodes.length).toBe(10);

      // Verify token
      const isOtpValid = OrganizationMFAManager.getInstance().verifyTOTPToken(userId, orgId, '123456');
      expect(isOtpValid).toBe(true);

      // Consume recovery codes
      const sampleCode = setup.recoveryCodes[0];
      const consumeSuccess = OrganizationMFAManager.getInstance().verifyAndConsumeRecoveryCode(userId, orgId, sampleCode);
      expect(consumeSuccess).toBe(true);
      expect(setup.recoveryCodes.length).toBe(9);

      // Disallowed reuse of consumed code
      const consumeFailure = OrganizationMFAManager.getInstance().verifyAndConsumeRecoveryCode(userId, orgId, sampleCode);
      expect(consumeFailure).toBe(false);
    });

    it('should handle email OTP verification cycle correctly', () => {
      const mockEmail = 'user@company.com';
      const code = OrganizationMFAManager.getInstance().initiateEmailVerification(userId, orgId, mockEmail);

      expect(code.length).toBe(6);

      // Verify wrong code fails
      const wrongVerify = OrganizationMFAManager.getInstance().verifyEmailOTP(userId, orgId, '000000');
      expect(wrongVerify).toBe(false);

      // Verify correct code passes and enables MFA
      const correctVerify = OrganizationMFAManager.getInstance().verifyEmailOTP(userId, orgId, code);
      expect(correctVerify).toBe(true);

      const finalConfig = OrganizationMFAManager.getInstance().getConfig(userId, orgId);
      expect(finalConfig.enabled).toBe(true);
      expect(finalConfig.emailVerified).toBe(true);
    });
  });

  describe('OrganizationAuditPoliciesManager (Policies and audits)', () => {
    it('should assert password policies against weak passwords', () => {
      const pols = OrganizationAuditPoliciesManager.getInstance().getPolicies(orgId);
      pols.passwordPolicy.minLength = 10;
      pols.passwordPolicy.requireUppercase = true;
      pols.passwordPolicy.requireSpecialCharacters = true;
      OrganizationAuditPoliciesManager.getInstance().savePolicies(pols);

      // Too short
      expect(() => {
        OrganizationAuditPoliciesManager.getInstance().validatePassword(orgId, 'Ab1!');
      }).toThrow('A senha deve ter pelo menos 10 caracteres.');

      // Lacks upper
      expect(() => {
        OrganizationAuditPoliciesManager.getInstance().validatePassword(orgId, 'abcdef12!@');
      }).toThrow('A senha deve conter pelo menos uma letra maiúscula.');

      // Lacks special
      expect(() => {
        OrganizationAuditPoliciesManager.getInstance().validatePassword(orgId, 'ABCDef1234');
      }).toThrow('A senha deve conter pelo menos um caractere especial');

      // Passes
      expect(() => {
        OrganizationAuditPoliciesManager.getInstance().validatePassword(orgId, 'ABCDef12!@');
      }).not.toThrow();
    });

    it('should restrict access by IP Whitelists and Domain restrictions', () => {
      const pols = OrganizationAuditPoliciesManager.getInstance().getPolicies(orgId);
      pols.ipAllowList = ['192.168.1.55', '10.0.*'];
      pols.domainRestrictions = ['mycompany.com'];
      OrganizationAuditPoliciesManager.getInstance().savePolicies(pols);

      // IP Checks
      expect(OrganizationAuditPoliciesManager.getInstance().checkIPAllowList(orgId, '192.168.1.55')).toBe(true);
      expect(OrganizationAuditPoliciesManager.getInstance().checkIPAllowList(orgId, '10.0.1.200')).toBe(true);
      expect(OrganizationAuditPoliciesManager.getInstance().checkIPAllowList(orgId, '189.55.12.3')).toBe(false);

      // Domain Checks
      expect(OrganizationAuditPoliciesManager.getInstance().checkDomainRestrictions(orgId, 'john@mycompany.com')).toBe(true);
      expect(OrganizationAuditPoliciesManager.getInstance().checkDomainRestrictions(orgId, 'john@gmail.com')).toBe(false);
    });

    it('should log compliance and authentication audits correctly', () => {
      OrganizationAuditPoliciesManager.getInstance().logAuthAction({
        userId,
        userName: 'John Identity',
        action: 'auth.sso_login',
        description: 'Efetuou login via Google SSO com sucesso.',
        organizationId: orgId,
      });

      const logs = OrganizationAuditPoliciesManager.getInstance().getLocalLogs(orgId);
      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe('auth.sso_login');
      expect(logs[0].description).toContain('Efetuou login via Google SSO');
      expect(logs[0].hash).toBeDefined();
    });
  });
});
