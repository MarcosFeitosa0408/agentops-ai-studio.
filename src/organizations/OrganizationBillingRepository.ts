import { OrganizationPlanType, PLAN_LIMITS } from './OrganizationPlans';
import { OrganizationSubscription, OrganizationSubscriptionStatus } from './OrganizationSubscription';
import { OrganizationUsage } from './OrganizationUsage';

export class OrganizationBillingRepository {
  private static SUBS_KEY = 'agentops_org_subscriptions';
  private static USAGE_KEY = 'agentops_org_usages';
  private static TRIALS_KEY = 'agentops_org_trials_used';

  private static inMemorySubs: Record<string, OrganizationSubscription> = {};
  private static inMemoryUsage: Record<string, OrganizationUsage> = {};
  private static inMemoryTrials: Record<string, boolean> = {};

  private static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // Subscriptions persistence
  static getSubscription(orgId: string): OrganizationSubscription | null {
    if (this.isBrowser()) {
      try {
        const data = localStorage.getItem(this.SUBS_KEY);
        if (data) {
          const subs = JSON.parse(data) as Record<string, OrganizationSubscription>;
          return subs[orgId] || null;
        }
      } catch (e) {
        console.error('Error reading subscription from localStorage', e);
      }
    }
    return this.inMemorySubs[orgId] || null;
  }

  static saveSubscription(sub: OrganizationSubscription): void {
    if (this.isBrowser()) {
      try {
        const data = localStorage.getItem(this.SUBS_KEY);
        const subs = data ? (JSON.parse(data) as Record<string, OrganizationSubscription>) : {};
        subs[sub.organizationId] = sub;
        localStorage.setItem(this.SUBS_KEY, JSON.stringify(subs));
      } catch (e) {
        console.error('Error saving subscription to localStorage', e);
      }
    }
    this.inMemorySubs[sub.organizationId] = sub;
  }

  // Usage persistence
  static getUsage(orgId: string): OrganizationUsage {
    if (this.isBrowser()) {
      try {
        const data = localStorage.getItem(this.USAGE_KEY);
        if (data) {
          const usages = JSON.parse(data) as Record<string, OrganizationUsage>;
          if (usages[orgId]) return usages[orgId];
        }
      } catch (e) {
        console.error('Error reading usage from localStorage', e);
      }
    }
    if (!this.inMemoryUsage[orgId]) {
      this.inMemoryUsage[orgId] = {
        organizationId: orgId,
        currentUsers: 0,
        currentWorkers: 0,
        currentWorkflows: 0,
        currentPlugins: 0,
        memoryConsumption: 0,
        storageConsumption: 0,
        monthlyExecutions: 0,
        apiUsage: 0,
        dashboardUsage: 0,
        workerExecutions: {},
      };
    }
    return this.inMemoryUsage[orgId];
  }

  static saveUsage(usage: OrganizationUsage): void {
    if (this.isBrowser()) {
      try {
        const data = localStorage.getItem(this.USAGE_KEY);
        const usages = data ? (JSON.parse(data) as Record<string, OrganizationUsage>) : {};
        usages[usage.organizationId] = usage;
        localStorage.setItem(this.USAGE_KEY, JSON.stringify(usages));
      } catch (e) {
        console.error('Error saving usage to localStorage', e);
      }
    }
    this.inMemoryUsage[usage.organizationId] = usage;
  }

  // Trial activation tracker (prevents abuse)
  static hasUsedTrial(orgId: string): boolean {
    if (this.isBrowser()) {
      try {
        const data = localStorage.getItem(this.TRIALS_KEY);
        if (data) {
          const trials = JSON.parse(data) as Record<string, boolean>;
          return !!trials[orgId];
        }
      } catch (e) {
        console.error('Error reading trials from localStorage', e);
      }
    }
    return !!this.inMemoryTrials[orgId];
  }

  static recordTrialUsed(orgId: string): void {
    if (this.isBrowser()) {
      try {
        const data = localStorage.getItem(this.TRIALS_KEY);
        const trials = data ? (JSON.parse(data) as Record<string, boolean>) : {};
        trials[orgId] = true;
        localStorage.setItem(this.TRIALS_KEY, JSON.stringify(trials));
      } catch (e) {
        console.error('Error recording trial used to localStorage', e);
      }
    }
    this.inMemoryTrials[orgId] = true;
  }

  // Core actions
  static createSubscription(
    orgId: string,
    plan: OrganizationPlanType,
    status: OrganizationSubscriptionStatus = 'Active',
    billingCycle: 'monthly' | 'annually' = 'monthly',
  ): OrganizationSubscription {
    const started = new Date();
    const expires = new Date();
    expires.setMonth(expires.getMonth() + (billingCycle === 'monthly' ? 1 : 12));

    let price = 0;
    if (plan === 'Pro' || plan === 'Professional') {
      price = billingCycle === 'monthly' ? 49 : 470;
    } else if (plan === 'Enterprise') {
      price = billingCycle === 'monthly' ? 499 : 4790;
    } else if (plan === 'Custom') {
      price = billingCycle === 'monthly' ? 999 : 9590;
    }

    const sub: OrganizationSubscription = {
      id: `sub-${Math.random().toString(36).substring(2, 9)}`,
      organizationId: orgId,
      plan,
      status,
      billingCycle,
      startedAt: started.toISOString(),
      expiresAt: expires.toISOString(),
      renewalDate: expires.toISOString(),
      price,
      currency: 'USD',
      paymentStatus: 'Paid',
    };

    this.saveSubscription(sub);
    return sub;
  }

  static activateTrial(orgId: string): OrganizationSubscription {
    if (this.hasUsedTrial(orgId)) {
      throw new Error('Abuso de trial detectado: Esta organização já utilizou o período de testes gratuito.');
    }

    const existingSub = this.getSubscription(orgId);
    if (existingSub && existingSub.status !== 'Expired' && existingSub.status !== 'Cancelled') {
      throw new Error('Não é possível ativar trial em uma assinatura ativa existente.');
    }

    const started = new Date();
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 14); // 14-day trial

    const sub: OrganizationSubscription = {
      id: `sub-trial-${Math.random().toString(36).substring(2, 9)}`,
      organizationId: orgId,
      plan: 'Professional', // Trials default to Professional
      status: 'Trial',
      billingCycle: 'monthly',
      startedAt: started.toISOString(),
      expiresAt: trialEnds.toISOString(),
      renewalDate: trialEnds.toISOString(),
      trialEndsAt: trialEnds.toISOString(),
      price: 0,
      currency: 'USD',
      paymentStatus: 'Pending',
    };

    this.recordTrialUsed(orgId);
    this.saveSubscription(sub);
    return sub;
  }

  static upgradePlan(orgId: string, newPlan: OrganizationPlanType): OrganizationSubscription {
    const current = this.getSubscription(orgId);
    if (!current) {
      return this.createSubscription(orgId, newPlan);
    }

    // Upgrades are always allowed. Reset dates or calculate pro-rata as needed
    const updated: OrganizationSubscription = {
      ...current,
      plan: newPlan,
      status: current.status === 'Trial' ? 'Active' : current.status, // Exit trial upon upgrade
      price: newPlan === 'Enterprise' ? 499 : newPlan === 'Custom' ? 999 : 49,
      paymentStatus: 'Paid',
    };

    this.saveSubscription(updated);
    return updated;
  }

  static downgradePlan(orgId: string, newPlan: OrganizationPlanType, currentUsage: OrganizationUsage): OrganizationSubscription {
    const current = this.getSubscription(orgId);
    if (!current) {
      throw new Error('Nenhuma assinatura encontrada para realizar o downgrade.');
    }

    // Safety checks: check new plan limits against current usage
    const targetLimits = PLAN_LIMITS[newPlan];
    if (!targetLimits) {
      throw new Error(`Plano de destino inválido: ${newPlan}`);
    }

    if (currentUsage.currentUsers > targetLimits.maxUsers) {
      throw new Error(
        `Impossível realizar downgrade: O uso atual de usuários (${currentUsage.currentUsers}) excede o limite do plano ${newPlan} (${targetLimits.maxUsers}).`,
      );
    }
    if (currentUsage.currentWorkers > targetLimits.maxWorkers) {
      throw new Error(
        `Impossível realizar downgrade: O uso atual de workers (${currentUsage.currentWorkers}) excede o limite do plano ${newPlan} (${targetLimits.maxWorkers}).`,
      );
    }
    if (currentUsage.currentWorkflows > targetLimits.maxWorkflows) {
      throw new Error(
        `Impossível realizar downgrade: O uso atual de workflows (${currentUsage.currentWorkflows}) excede o limite do plano ${newPlan} (${targetLimits.maxWorkflows}).`,
      );
    }
    if (currentUsage.currentPlugins > targetLimits.maxPlugins) {
      throw new Error(
        `Impossível realizar downgrade: O uso atual de plugins (${currentUsage.currentPlugins}) excede o limite do plano ${newPlan} (${targetLimits.maxPlugins}).`,
      );
    }
    if (currentUsage.memoryConsumption > targetLimits.maxMemory) {
      throw new Error(
        `Impossível realizar downgrade: O consumo de memória cognitiva (${(currentUsage.memoryConsumption / (1024 * 1024)).toFixed(1)} MB) excede o limite do plano ${newPlan} (${(targetLimits.maxMemory / (1024 * 1024)).toFixed(1)} MB).`,
      );
    }
    if (currentUsage.storageConsumption > targetLimits.maxStorage) {
      throw new Error(
        `Impossível realizar downgrade: O consumo de armazenamento (${(currentUsage.storageConsumption / (1024 * 1024)).toFixed(1)} MB) excede o limite do plano ${newPlan} (${(targetLimits.maxStorage / (1024 * 1024)).toFixed(1)} MB).`,
      );
    }
    if (currentUsage.dashboardUsage > targetLimits.maxDashboards) {
      throw new Error(
        `Impossível realizar downgrade: O uso de dashboards (${currentUsage.dashboardUsage}) excede o limite do plano ${newPlan} (${targetLimits.maxDashboards}).`,
      );
    }

    const updated: OrganizationSubscription = {
      ...current,
      plan: newPlan,
      status: 'Active',
      price: newPlan === 'Starter' ? 0 : newPlan === 'Pro' || newPlan === 'Professional' ? 49 : 499,
      paymentStatus: 'Paid',
    };

    this.saveSubscription(updated);
    return updated;
  }

  static renewSubscription(orgId: string): OrganizationSubscription {
    const current = this.getSubscription(orgId);
    if (!current) {
      throw new Error('Nenhuma assinatura ativa encontrada para renovação.');
    }

    const newExpires = new Date(current.expiresAt);
    newExpires.setMonth(newExpires.getMonth() + (current.billingCycle === 'monthly' ? 1 : 12));

    const updated: OrganizationSubscription = {
      ...current,
      status: 'Active',
      expiresAt: newExpires.toISOString(),
      renewalDate: newExpires.toISOString(),
      paymentStatus: 'Paid',
    };

    this.saveSubscription(updated);
    return updated;
  }

  static cancelSubscription(orgId: string): OrganizationSubscription {
    const current = this.getSubscription(orgId);
    if (!current) {
      throw new Error('Nenhuma assinatura encontrada para cancelar.');
    }

    const updated: OrganizationSubscription = {
      ...current,
      status: 'Cancelled',
    };

    this.saveSubscription(updated);
    return updated;
  }

  static clearInMemory(): void {
    this.inMemorySubs = {};
    this.inMemoryUsage = {};
    this.inMemoryTrials = {};
  }
}
