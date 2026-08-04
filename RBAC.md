# AgentOps AI Studio — Role-Based Access Control (RBAC) & Route Protection

## Overview
AgentOps AI Studio features a robust enterprise-grade **Role-Based Access Control (RBAC)** security layer. It gates pages, protects routes, and prevents unauthorized actions at the API/Tool levels, ensuring complete corporate compliance and data governance.

---

## 1. Functional Roles Matrix
The platform defines 6 distinct roles mapping to specific system clearances:

| Role | Description | Core Clearances |
| :--- | :--- | :--- |
| **Super Admin** | Full administrative and root access | `create/edit/delete:agents`, `manage:providers`, `run:python`, `run:sql`, `view:audit`, `manage:workspaces`, `view:billing` |
| **Admin** | Systems administrator | `create/edit/delete:agents`, `manage:providers`, `run:python`, `run:sql`, `view:audit`, `manage:workspaces` |
| **Manager** | Operations supervisor | `create/edit:agents`, `execute:agents`, `run:python`, `run:sql`, `view:audit` |
| **AI Developer** | System modeler | `create/edit:agents`, `execute:agents`, `run:python`, `run:sql` |
| **Data Analyst** | Business analyst | `execute:agents`, `run:sql` |
| **Viewer** | Auditor / Guest | `execute:agents` (Read-only) |

---

## 2. RBAC Service (`src/lib/rbac/rbacService.ts`)
The `RBACService` class acts as the centralized evaluator:
- **`hasPermission(role, permission)`**: Evaluates boolean authorization of a role against a target permission.
- **`getPermissions(role)`**: Returns the full permission array mapped to a specific role.

---

## 3. Frontend Gating & Helpers (`src/components/security/`)
Downstream views are protected using two core layout wrappers:

### A. Route Protection (`<RouteProtection>`)
Forces sessions to authenticate. If no SSO token is active, it blocks rendering and redirects the visitor back to `/login`:
```tsx
import { RouteProtection } from '@/components/security/RouteProtection';

export default function Dashboard() {
  return (
    <RouteProtection>
      <DashboardView />
    </RouteProtection>
  );
}
```

### B. Permission Guard (`<PermissionGuard>`)
Selectively shows or hides buttons and UI blocks depending on the active user role:
```tsx
import { PermissionGuard } from '@/components/security/PermissionGuard';

<PermissionGuard permission="manage:workspaces">
  <Button>Create Workspace</Button>
</PermissionGuard>
```

---

## 4. API Tool Level Protection
SSO Roles are protected down to tool calls. The `ToolRegistry` evaluates the active user session during plugin executions:
- **Viewer Role Checks:** If the user has a `Viewer` role, they are blocked from executing write-based plugin requests (like sending emails on Slack/Gmail, creating Notion pages, or running `INSERT/UPDATE` SQL queries).
- **Execution Blocker:** Attempts to execute write actions as a `Viewer` trigger a secure termination exception:
  `SSO Permission Denied: Your current role 'Viewer' does not allow executing write/modify actions on this plugin.`
