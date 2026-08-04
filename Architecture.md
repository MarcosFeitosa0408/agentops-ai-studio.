# AgentOps AI Studio — Architecture Guide

## Overview
AgentOps AI Studio is built on an enterprise-grade, highly modular architecture using Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, and Vitest. The platform is designed for dynamic agent orchestration, visual workflow automation, cognitive memory and RAG retrieval, and extensible Model Context Protocol (MCP) plugin integrations.

```
       +--------------------------------------------------------+
       |                  Enterprise UI Layer                   |
       |  (Dashboard, Workflows, Agents, Plugins, Memory, RAG)  |
       +--------------------------------------------------------+
                                   |
                                   v
       +--------------------------------------------------------+
       |                 Central Governance Core                 |
       |      (AuthContext, RBACService, WorkspaceIsolation)     |
       +--------------------------------------------------------+
                                   |
        +--------------------------+--------------------------+
        |                          |                          |
        v                          v                          v
+--------------+           +--------------+           +--------------+
| AI Service   | <-------- | Memory & RAG | <-------- | Tools Engine |
| (Gateway API)|           | (Cognitive)  |           | (Agent Exec) |
+--------------+           +--------------+           +--------------+
        ^                          ^                          ^
        |                          |                          |
        +--------------------------+--------------------------+
                                   |
                                   v
       +--------------------------------------------------------+
       |                 Platform Services Core                 |
       |      (WorkflowEngine, PluginRegistry, MCP Transport)    |
       +--------------------------------------------------------+
                                   |
                                   v
       +--------------------------------------------------------+
       |               Observability & Monitoring               |
       |     (MonitoringService, StandardizedLoggingService)    |
       +--------------------------------------------------------+
```

---

## 1. Multi-LLM Provider Architecture & AI Gateway (`src/lib/ai/`)
- **Abstract Common Provider Model:** All LLM interactions route through the `AIService` gateway singleton. Providers (OpenAI, Anthropic, Gemini, OpenRouter, Ollama, Azure) implement the common `BaseAIProvider` interface.
- **State Persistence:** Configuration state (active provider, model IDs, temperature, max tokens, streaming toggles) is managed globally via `AIConfigProvider` and persisted in the browser `localStorage`.
- **Decoupled Gateway Routing:** Front-end pages never import or communicate with individual provider implementations directly, protecting API key isolation and preventing backend bleeding.

---

## 2. Memory System & RAG Foundation (`src/lib/memory/` & `src/lib/rag/`)
- **Short-Term and Long-Term Memory:** Implemented under a unified `MemoryService` using a lightweight hydration-safe `localStorage` storage driver (`MemoryStorage`). Memory is segmented across scopes (`conversation`, `agent`, `project`, `user`, `global`).
- **RAG Document Indexing and Parsing:** Simulates full PDF, DOCX, and Markdown parsing, storing text chunks with rich metadata. The `RetrievalService` runs keyword indexing and retrieval, ranking matching chunks and appending formatted context directly into system prompts.

---

## 3. Tools Engine & Orchestration Layer (`src/lib/tools/`)
- **Declarative Tools Ecosystem:** Custom tools extend the `BaseTool` class, which handles standard parameter validation schemas, health checks, and metadata serialization.
- **Agent Executor & Planning:** Under `AgentExecutor.ts`, user queries are parsed to trigger rule-based heuristic planning (e.g. calculator tool for mathematical queries, Python tool for data frames).
- **Multi-Agent Orchestrator:** The `AgentOrchestrator` runs single agents or coordinates multi-agent sequential or parallel chains, passing shared context variables across steps with delegation logging.

---

## 4. Workflow Automation Engine (`src/lib/workflows/`)
- **Direct Acyclic Graphs (DAG) Executor:** Under `WorkflowEngine.ts` and `WorkflowRunner.ts`, the system parses JSON-RPC style node and edge diagrams, running sequential and conditional branches.
- **Safety Cycles Guard:** Incorporates a robust cyclic checker that detects circular loops and throws errors if an infinite iteration threshold is reached.

---

## 5. Model Context Protocol (MCP) Ecosystem (`src/lib/mcp/`)
- **Standard Protocol Implementations:** Client (`BaseMcpClient`), Server (`BaseMcpServer`), and Transport (`InMemoryMcpTransport`) coordinate using official JSON-RPC 2.0 messages.
- **Connector Manager:** Enables 8 built-in standard connectors (GitHub, Slack, Gmail, Notion, Google Drive, PostgreSQL, MySQL, Filesystem) running inside isolated virtual server processes.
- **Secret Manager:** AES-256-GCM mock symmetric cryptography engine secures and protects sensitive plugin credentials.

---

## 6. Governance, SSO, RBAC & Workspaces (`src/lib/auth/`, `src/lib/rbac/`, `src/lib/workspaces/`)
- **SSO Authentication Portal:** Standard login session portal simulating corporate profiles.
- **Role-Based Access Control:** Strict role mapping matrix (`Super Admin`, `Admin`, `Manager`, `AI Developer`, `Data Analyst`, `Viewer`) gated via `<RouteProtection>` and `<PermissionGuard>`.
- **Workspace Isolation:** Dynamically segregates agents, logs, and memories depending on active workspace departments.
