# AgentOps AI Studio

Enterprise AI Agent Platform for Data Analysis, Automation and Business Intelligence.

---

## Project Overview

AgentOps AI Studio is an enterprise-grade platform engineered to build, coordinate, and monitor autonomous AI agents. The platform empowers organizations to automate complex data analysis pipelines, execute cross-application workflows, and deliver real-time business intelligence with complete oversight and auditability.

## Vision

Our vision is to bridge the gap between advanced large language models (LLMs) and practical business operations. By providing an intuitive, secure, and robust orchestration workspace, AgentOps AI Studio enables business analysts and developers alike to build reliable multi-agent systems that solve actual business challenges without the common fragility of bespoke integration code.

## Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React Server Components)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Type-safe compilation)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Rapid UI utility styling)
- **Linting & Formatting:** [ESLint](https://eslint.org/) (Standard Flat Config) & [Prettier](https://prettier.io/)
- **Package Manager:** npm

## Project Structure

```text
├── .next/                  # Next.js build output
├── node_modules/           # Node dependencies
├── public/                 # Static assets
└── src/
    ├── app/                # Next.js App Router (pages, layout, routing)
    ├── components/         # Reusable UI & Layout Components
    │   ├── layout/         # Shell layout blocks (Topbar, Sidebar, etc.)
    │   ├── memory/         # Reusable Memory UI components (cards, timelines, filters)
    │   ├── rag/            # Reusable RAG UI components (index status, uploaders, previewers)
    │   ├── tools/          # Reusable timeline, step and metrics tool components
    │   ├── workflows/      # Reusable visual canvases, inspectors, mini-maps and toolbars
    │   └── ui/             # Reusable atomic UI elements (Buttons, Inputs, etc.)
    ├── context/            # React Context state providers (ThemeContext, AgentContext, AuthContext, WorkspaceContext, AuditContext, SettingsContext)
    ├── hooks/              # Custom React Hooks (useIsMounted)
    ├── lib/                # Modular utilities and third-party clients
    │   ├── ai/             # Cognitive AI Gateway layer (providers, services, types)
    │   ├── audit/          # Compliance Audit Engine (types, service)
    │   ├── auth/           # Decentralized Authentication & Sessions (types, service)
    │   ├── memory/         # Local Memory System (types, storage, service, hooks, utils)
    │   ├── rag/            # Local RAG System (types, parsers, indexers, services, hooks, utils)
    │   ├── rbac/           # Role-Based Access Control System (types, service)
    │   ├── settings/       # Enterprise Settings & Policy controls (types, service)
    │   ├── tools/          # Tools Engine, Execution Pipeline, Agent Executor & Orchestrator
    │   ├── workflows/      # Workflow Engine, Runner, Logs, Triggers and Execution Monitor
    │   └── workspaces/     # Workspace Management & Isolation (types, service)
    └── types/              # Global TypeScript interfaces and definitions
```

---

## Sprint 2 — Enterprise Design System

Our repository features a complete, highly-scalable **Enterprise Design System & UI Core** designed with premium SaaS aesthetics (inspired by Linear, Stripe, and OpenAI). All visual constants are configured as semantic **Design Tokens** in `src/app/globals.css` and map to Tailwind.

---

## Sprint 4 — Multi-LLM Provider Architecture & AI Gateway

Sprint 4 introduces the modular cognitive core of the AgentOps AI Studio. This architecture prepares the entire platform to support multiple model backends with total abstraction, decoupled gateways, and zero changes to downstream agent/workspace modules.

---

## Sprint 5 — Memory System & RAG Foundation

Sprint 5 establishes the comprehensive architectural foundation for context retention, persistent user personalization, and Retrieval-Augmented Generation (RAG).

---

## Sprint 6 — Tools Engine, Agent Execution & Multi-Agent Orchestration

Sprint 6 transforms AgentOps AI Studio from a conversational interface into an executable multitool platform. It allows specialized AI agents to plan and call programmatic tools, aggregate data, and cooperate with each other under unified orchestration schemas.

---

## Sprint 7 — Workflow Automation Engine & Multi-Agent Collaboration

Sprint 7 delivers the core enterprise capabilities for creating, visual mapping, running, and auditing multi-step automation diagrams.

---

## Sprint 8 — Enterprise Workspace, Authentication, RBAC & Governance

Sprint 8 introduces robust enterprise governance, decentralized Single Sign-On (SSO) authentication, fine-grained Role-Based Access Control (RBAC), multi-tenant/workspace level data isolation, secure API Key storage (Vault), and compliance tamper-proof audit trails.

### 1. Decentralized SSO Authentication & Session Management
- **Enterprise Portal (`/login` & `/register`):** Single Sign-On style portal mapping users dynamically based on corporate profiles (`marcos@agentops.ai`, `julia@agentops.ai`, etc.).
- **Token Rotation & Rotation Sim (`/profile`):** Simulates JWT Token renewal and key rotation with interactive timers and manual rotation triggers.

### 2. Role-Based Access Control (RBAC) & Route Protection
- **Functional Roles:** Maps system functionality to roles: `Super Admin`, `Admin`, `Manager`, `AI Developer`, `Data Analyst`, and `Viewer`.
- **Security Helpers (`<RouteProtection>` & `<PermissionGuard>`):** Gates unauthorized page access, automatically routing visitors back to the portal and selectively hiding/showing atomic features based on user permission.
- **RBAC Matrix (`/security`):** Dedicated matrix dashboard illustrating all system alçadas mapped visually to corporate roles.

### 3. Dynamic Workspace Isolation
- **Switchable Workspaces (`/workspaces`):** Multi-tenant isolated workspace modules (e.g. `Finance Workspace`, `Marketing Workspace`, `Engineering Workspace`) enabling teams to segment their operation.
- **Active Workspace Selector (Topbar):** Allows switching workspaces globally, dynamically filtering agents, logs, and memories displayed on the Dashboard based on the department domain.

### 4. Compliance Audit Logs (Tamper-Proof)
- **Central Compliance Trail (`/admin`):** Fully traceable activity log capturing critical system actions (logins, workspace creations, backups, credential viewing, etc.).
- **Tamper-Proof Verification:** Appends unique mock SHA-256 signatures to each entry, simulating strict IT compliance protocols.

### 5. Secure Key Vault & Backup DR
- **Vault API Cryptography Widget:** Simulates encrypted local storage of sensitive provider API keys using a mock AES-256 GCM vault layer.
- **Disaster Recovery (DR) Backups:** Trigger complete system snapshots as JSON files and restore platform status through file imports.

---

## Sprint 9 — MCP Plugin Ecosystem (Feature Sprint)

Sprint 9 delivers a comprehensive, enterprise-ready **Plugin Ecosystem** built on the **Model Context Protocol (MCP)** specification. This modular implementation connects the AgentOps AI Studio seamlessly to external systems, databases, filesystems, and collaboration suites, utilizing standard JSON-RPC 2.0 and high-security credential encryption.

### 1. Model Context Protocol (MCP) Architecture Layer (`src/lib/mcp/`)
Our MCP layer implements a complete bidirectional architecture allowing the client and server to exchange resources, tools, and prompts without major refactoring:
- **`McpTransport` / `InMemoryMcpTransport`:** A symmetric bidirectional in-memory message bus passing JSON-RPC 2.0 requests, responses, and notifications asynchronously with delivery delays.
- **`McpClient` / `BaseMcpClient`:** Client connection manager that initializes connections, list tools, reads resources, and coordinates call requests with 10-second pending request timeouts.
- **`McpServer` / `BaseMcpServer`:** Core server routing requests based on standard protocols (`initialize`, `tools/list`, `tools/call`, `resources/list`, `resources/read`).
- **`McpServerRegistry`:** Registers and tracks active, running MCP virtual servers globally in the browser.

### 2. Plugin SDK (`src/plugins/`)
Each plugin exposes a clean, standardized SDK footprint:
- **`manifest.json`:** Declares basic parameters (ID, Name, Description, Version, Author, Icon, Category, Permissions).
- **`schema.json`:** Formats input parameters using JSON Schema constraints for client validation.
- **`permissions.ts`:** Explicitly lists required permissions and access scopes.
- **`plugin.ts`:** Executes operations with full metrics tracking, sandboxed parameters, and decrypted credential injection.

### 3. Connector Manager & 8 Mock Connectors (`src/lib/mcp/ConnectorManager.ts`)
The `ConnectorManager` converts active Plugins into virtual MCP Servers, linking them to MCP clients over `InMemoryMcpTransport` sessions. We built 8 standard high-fidelity connectors under `src/plugins/`:
1. **GitHub:** Searches issues, fetches repository statistics, and simulates creating issues.
2. **Slack:** Lists channels and posts messages to specific channels.
3. **Gmail:** Searches email threads and sends simulated Gmail messages.
4. **Notion:** Creates Notion database pages and queries workspace nodes.
5. **Google Drive:** Lists folder files and simulates uploading files.
6. **PostgreSQL:** Executes raw relational SQL queries and filters row objects.
7. **MySQL:** Simulates MySQL schema querying, relational row retrieval, and modes.
8. **Filesystem:** Performs simulated file reading, writing, and directory listing on volume nodes.

### 4. Encrypted Secret Manager (`src/lib/mcp/SecretManager.ts`)
Stores third-party API Keys, OAuth Tokens, and Database Credentials securely:
- **AES-256-GCM Encryption:** Simulates high-security master-key salted symmetric decryption and encryption.
- **Abstaction Provider:** Supports swap-ready encryption engines (e.g. AWS KMS or HashiCorp Vault) by implementing a simple interface.

### 5. Dynamic Tool Discovery & SSO-RBAC Permission System
- **Automatic Discovery:** The central `ToolRegistry` is patched to automatically fetch enabled plugins from the `PluginRegistry` and convert them into virtual executable `PluginTool` objects. Agents discover them instantly with zero manual registration.
- **SSO Role-Based Guards:** Dynamic verification verifies if the current authenticated user's SSO role has the authority to execute write/modify operations (like sending emails, creating pages, writing files, or inserting rows). Restricted roles (like `Viewer`) are blocked from write operations and are limited to read-only calls.

### 6. Marketplace & Monitoring UI (`/plugins` & Dashboard)
- **Plugin Marketplace (`/plugins`):** Elegant marketplace to browse, install, enable, disable, update, remove, and configure connectors (opening the secure modal to encrypt and save secrets).
- **Monitoring Analytics:** Each connector tracks detailed execution state: latency (ms), success and error counters, health status (Healthy/Degraded), and last execution timestamp.
- **Dashboard Widgets:** Integrated MCP metrics into the main Dashboard, displaying total active connectors, average protocol latency, overall health rate, and Secret Manager status cards.

### 7. Semantic Versioning (SemVer Validation)
- **SemVer Compliance:** `PluginRegistry` parses and validates formatting for all plugin versions.
- **Collision & Deprecation Checks:** Prevents installing duplicate plugin IDs with identical or older versions, and warns the user with deprecation badges if the version is below `1.0.0` or marked as deprecated.

---

## Future Integration Roadmap

Downstream modules do not call external databases or embedding endpoints. When we transition from local mocks to cloud providers in future Sprints, the following layers will be integrated:

```text
+-----------------------+      +--------------------------+
|      AIService        | ---> |     RetrievalService     |
+-----------------------+      +--------------------------+
            |                               |
            v                               v
+-----------------------+      +--------------------------+
|   Embedding Layer     |      |      Vector Database     |
|   (OpenAI / Gemini)   |      |  (Chroma / pgvector/ etc)|
+-----------------------+      +--------------------------+
```

### 1. Future Embedding Layer
All cognitive converted queries and text chunks will be piped through an embedding service (such as OpenAI `text-embedding-3-small` or HuggingFace transformers). This layer will replace text strings with a dense `1536` dimensional float vector representing the semantic meaning of the words.

### 2. Future Vector Database
Instead of `localStorage` search loops, `ChunkIndexer` and `MemoryStorage` will read/write vectors to an external Vector Database (such as ChromeDB, pgvector, pg, Pinecone, or Qdrant). The database will indexing document embeddings to allow high-performance operations.

### 3. Future Retrieval Pipeline
Our current keyword matching will be upgraded to hybrid search (combining BM25 keyword matching with Dense Vector Cosine Similarity) followed by secondary re-ranking (Cross-Encoders) to optimize and select the top-N absolute most relevant context snippets.

---

## Development Workflow

1. **Linting:** Ensure code standard compliance by running `npm run lint`.
2. **Formatting:** Automatically format the code using Prettier with `npx prettier --write .`.
3. **Building:** Validate TypeScript typing and Next.js compilation via `npm run build`.

## Installation

To get started, clone the repository and run the following commands:

```bash
# Install dependencies
npm install

# Start the local development server
npm run dev

# Format code
npx prettier --write .

# Build for production
npm run build
```

---

## License

This project is licensed under the Proprietary License. All rights reserved.
