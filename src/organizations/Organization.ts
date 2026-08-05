import { OrganizationPlanType, OrganizationPlanLimits } from './OrganizationPlans';
import { OrganizationSettings } from './OrganizationSettings';

export interface Organization {
  id: string;
  name: string;
  logo: string;
  plan: OrganizationPlanType;
  ownerId: string;
  createdAt: string;
  status: 'active' | 'inactive';
  users: string[]; // User IDs belonging to this organization
  workers: string[]; // Worker IDs belonging to this organization
  plugins: string[]; // Plugin IDs belonging to this organization
  workflows: string[]; // Workflow IDs belonging to this organization
  dashboards: string[]; // Dashboard IDs/keys belonging to this organization
  settings: OrganizationSettings;
  limits: OrganizationPlanLimits;
}
