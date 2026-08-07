export interface SAMLSettings {
  entryPoint: string;
  issuer: string;
  cert: string;
}

export interface OIDCSettings {
  clientId: string;
  clientSecret?: string;
  discoveryUrl: string;
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  userinfoEndpoint?: string;
}

export interface SingleSignOnConfig {
  organizationId: string;
  enabled: boolean;
  allowedProviders: ('google' | 'microsoft' | 'github' | 'azure_ad' | 'saml' | 'oidc')[];
  samlSettings?: SAMLSettings;
  oidcSettings?: OIDCSettings;
  requireSSO: boolean; // if true, passwords are bypassed / blocked
}

export class OrganizationSSOManager {
  private static instance: OrganizationSSOManager;
  private STORAGE_KEY = 'agentops_sso_configs_v1';
  private inMemoryConfigs: Record<string, SingleSignOnConfig> = {};

  private constructor() {
    this.load();
  }

  public static getInstance(): OrganizationSSOManager {
    if (!OrganizationSSOManager.instance) {
      OrganizationSSOManager.instance = new OrganizationSSOManager();
    }
    return OrganizationSSOManager.instance;
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
      console.error('Error loading SSO configurations:', e);
    }
  }

  private save(): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.inMemoryConfigs));
    } catch (e) {
      console.error('Error saving SSO configurations:', e);
    }
  }

  public getConfig(orgId: string): SingleSignOnConfig {
    if (!this.inMemoryConfigs[orgId]) {
      this.inMemoryConfigs[orgId] = {
        organizationId: orgId,
        enabled: false,
        allowedProviders: ['google'],
        requireSSO: false,
      };
    }
    return this.inMemoryConfigs[orgId];
  }

  public saveConfig(config: SingleSignOnConfig): void {
    this.inMemoryConfigs[config.organizationId] = config;
    this.save();
  }

  // Parses SAML metadata XML to mock-extract configuration properties
  public parseSAMLMetadata(xmlContent: string): SAMLSettings {
    if (!xmlContent.includes('<EntityDescriptor') && !xmlContent.includes('<md:EntityDescriptor')) {
      throw new Error('Invalid SAML Metadata XML: Missing EntityDescriptor root element.');
    }

    const entityIdMatch = xmlContent.match(/entityID="([^"]+)"/);
    const ssoLocationMatch = xmlContent.match(/Location="([^"]+)"/);
    const certMatch = xmlContent.match(/<X509Certificate>([\s\S]*?)<\/X509Certificate>/);

    return {
      issuer: entityIdMatch ? entityIdMatch[1] : 'https://saml.example.com/metadata',
      entryPoint: ssoLocationMatch ? ssoLocationMatch[1] : 'https://saml.example.com/sso',
      cert: certMatch ? certMatch[1].replace(/\s+/g, '') : 'MOCK_SAML_X509_CERTIFICATE',
    };
  }

  // Simulates OIDC discovery document resolution
  public async discoverOIDC(discoveryUrl: string): Promise<Partial<OIDCSettings>> {
    if (!discoveryUrl.startsWith('http://') && !discoveryUrl.startsWith('https://')) {
      throw new Error('Invalid discovery URL: Must be a fully-qualified HTTP/HTTPS endpoint.');
    }

    // Return mocked metadata resolution of /.well-known/openid-configuration
    return {
      discoveryUrl,
      authorizationEndpoint: `${discoveryUrl}/oauth/authorize`,
      tokenEndpoint: `${discoveryUrl}/oauth/token`,
      userinfoEndpoint: `${discoveryUrl}/oauth/userinfo`,
    };
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
