import { describe, it, expect, beforeEach } from 'vitest';
import { OrganizationBillingRepository } from '@/organizations/OrganizationBillingRepository';
import { OrganizationLimitValidator } from '@/organizations/OrganizationLimitValidator';
import { Organization } from '@/organizations/Organization';
import { OrganizationUsage } from '@/organizations/OrganizationUsage';
import { PLAN_LIMITS } from '@/organizations/OrganizationPlans';

describe('Organization Billing & Subscriptions (Module 3)', () => {
  const orgId = 'test-org-123';
  let mockOrg: Organization;

  beforeEach(() => {
    OrganizationBillingRepository.clearInMemory();

    mockOrg = {
      id: orgId,
      name: 'Test Billing Corp',
      logo: 'TBC',
      plan: 'Starter',
      ownerId: 'user-1',
      createdAt: new Date().toISOString(),
      status: 'active',
      users: [],
      workers: [],
      plugins: [],
      workflows: [],
      dashboards: [],
      settings: {
        requireMFA: false,
        sessionTimeoutMinutes: 60,
        themeColor: '#6d28d9',
        allowedLLMs: [],
        ipWhitelist: [],
        allowedPluginCategories: [],
        enableAuditLogSymmetricEncryption: false,
      },
      limits: PLAN_LIMITS.Starter,
    };
  });

  describe('Subscriptions Lifecycle', () => {
    it('should create a new subscription with correct plan pricing', () => {
      const sub = OrganizationBillingRepository.createSubscription(orgId, 'Professional', 'Active', 'monthly');

      expect(sub.organizationId).toBe(orgId);
      expect(sub.plan).toBe('Professional');
      expect(sub.status).toBe('Active');
      expect(sub.price).toBe(49);
      expect(sub.paymentStatus).toBe('Paid');

      const saved = OrganizationBillingRepository.getSubscription(orgId);
      expect(saved).not.toBeNull();
      expect(saved?.id).toBe(sub.id);
    });

    it('should renew a subscription correctly, extending renewalDate', () => {
      const sub = OrganizationBillingRepository.createSubscription(orgId, 'Professional', 'Active', 'monthly');
      const initialExpiry = new Date(sub.expiresAt);

      const renewed = OrganizationBillingRepository.renewSubscription(orgId);
      const renewedExpiry = new Date(renewed.expiresAt);

      expect(renewed.status).toBe('Active');
      expect(renewedExpiry.getTime()).toBeGreaterThan(initialExpiry.getTime());
    });

    it('should cancel a subscription, switching status to Cancelled', () => {
      OrganizationBillingRepository.createSubscription(orgId, 'Enterprise');
      const cancelled = OrganizationBillingRepository.cancelSubscription(orgId);

      expect(cancelled.status).toBe('Cancelled');
    });
  });

  describe('Trial Management & Abuse Prevention', () => {
    it('should allow activating a free Professional trial', () => {
      const trial = OrganizationBillingRepository.activateTrial(orgId);

      expect(trial.status).toBe('Trial');
      expect(trial.plan).toBe('Professional');
      expect(trial.price).toBe(0);
      expect(trial.trialEndsAt).toBeDefined();

      expect(OrganizationBillingRepository.hasUsedTrial(orgId)).toBe(true);
    });

    it('should block trial activation if trial has already been used', () => {
      OrganizationBillingRepository.activateTrial(orgId);

      // Try to activate again on same org should throw trial abuse error
      expect(() => {
        OrganizationBillingRepository.activateTrial(orgId);
      }).toThrow('Abuso de trial detectado');
    });
  });

  describe('Plan Upgrades & Downgrades (with limit validations)', () => {
    it('should allow upgrading a plan to Enterprise unconditionally', () => {
      OrganizationBillingRepository.createSubscription(orgId, 'Starter');

      const upgraded = OrganizationBillingRepository.upgradePlan(orgId, 'Enterprise');
      expect(upgraded.plan).toBe('Enterprise');
    });

    it('should allow plan downgrade if current resource usage is within target plan limits', () => {
      OrganizationBillingRepository.createSubscription(orgId, 'Professional');

      const usage = OrganizationBillingRepository.getUsage(orgId);
      usage.currentUsers = 3; // within Starter maxUsers (5)
      usage.currentWorkers = 2; // within Starter maxWorkers (3)
      usage.currentWorkflows = 2; // within Starter maxWorkflows (3)
      OrganizationBillingRepository.saveUsage(usage);

      const downgraded = OrganizationBillingRepository.downgradePlan(orgId, 'Starter', usage);
      expect(downgraded.plan).toBe('Starter');
    });

    it('should reject plan downgrade if current users exceed target limits', () => {
      OrganizationBillingRepository.createSubscription(orgId, 'Professional');

      const usage = OrganizationBillingRepository.getUsage(orgId);
      usage.currentUsers = 10; // Exceeds Starter maxUsers (5)
      OrganizationBillingRepository.saveUsage(usage);

      expect(() => {
        OrganizationBillingRepository.downgradePlan(orgId, 'Starter', usage);
      }).toThrow('O uso atual de usuários (10) excede o limite do plano Starter');
    });

    it('should reject plan downgrade if current workers exceed target limits', () => {
      OrganizationBillingRepository.createSubscription(orgId, 'Professional');

      const usage = OrganizationBillingRepository.getUsage(orgId);
      usage.currentWorkers = 5; // Exceeds Starter maxWorkers (3)
      OrganizationBillingRepository.saveUsage(usage);

      expect(() => {
        OrganizationBillingRepository.downgradePlan(orgId, 'Starter', usage);
      }).toThrow('O uso atual de workers (5) excede o limite do plano Starter');
    });
  });

  describe('Limit Validation (OrganizationLimitValidator)', () => {
    let usage: OrganizationUsage;

    beforeEach(() => {
      usage = {
        organizationId: orgId,
        currentUsers: 2,
        currentWorkers: 2,
        currentWorkflows: 2,
        currentPlugins: 1,
        memoryConsumption: 5 * 1024 * 1024, // 5MB
        storageConsumption: 20 * 1024 * 1024, // 20MB
        monthlyExecutions: 100,
        apiUsage: 200,
        dashboardUsage: 0,
        workerExecutions: {},
      };
    });

    it('should validate worker creation successfully under Starter limits', () => {
      mockOrg.plan = 'Starter';
      usage.currentWorkers = 2; // limit is 3

      expect(() => {
        OrganizationLimitValidator.validateWorkerCreation(mockOrg, usage);
      }).not.toThrow();
    });

    it('should reject worker creation if limits are reached', () => {
      mockOrg.plan = 'Starter';
      usage.currentWorkers = 3; // limit is 3

      expect(() => {
        OrganizationLimitValidator.validateWorkerCreation(mockOrg, usage);
      }).toThrow('Limite de workers atingido');
    });

    it('should validate memory allocations and reject if limits are exceeded', () => {
      mockOrg.plan = 'Starter'; // limit is 10MB
      usage.memoryConsumption = 8 * 1024 * 1024; // 8MB

      // Requesting 1MB should pass
      expect(() => {
        OrganizationLimitValidator.validateMemoryAllocation(mockOrg, usage, 1 * 1024 * 1024);
      }).not.toThrow();

      // Requesting 3MB should fail
      expect(() => {
        OrganizationLimitValidator.validateMemoryAllocation(mockOrg, usage, 3 * 1024 * 1024);
      }).toThrow('Limite de memória cognitiva atingido');
    });

    it('should validate storage allocation and reject if exceeded', () => {
      mockOrg.plan = 'Starter'; // limit is 50MB
      usage.storageConsumption = 45 * 1024 * 1024; // 45MB

      // Requesting 10MB should fail
      expect(() => {
        OrganizationLimitValidator.validateStorageAllocation(mockOrg, usage, 10 * 1024 * 1024);
      }).toThrow('Limite de armazenamento em disco atingido');
    });

    it('should validate API consumption limits', () => {
      mockOrg.plan = 'Starter'; // limit is 1000
      usage.apiUsage = 1001;

      expect(() => {
        OrganizationLimitValidator.validateApiConsumption(mockOrg, usage);
      }).toThrow('Limite de requisições de API atingido');
    });
  });
});
