import { OrganizationPlanType } from './OrganizationPlans';

export type OrganizationSubscriptionStatus =
  | 'Trial'
  | 'Active'
  | 'Past Due'
  | 'Suspended'
  | 'Cancelled'
  | 'Expired';

export interface OrganizationSubscription {
  id: string;
  organizationId: string;
  plan: OrganizationPlanType;
  status: OrganizationSubscriptionStatus;
  billingCycle: 'monthly' | 'annually';
  startedAt: string;
  expiresAt: string;
  renewalDate: string;
  trialEndsAt?: string;
  price: number;
  currency: string;
  paymentStatus: 'Paid' | 'Unpaid' | 'Pending';
}
