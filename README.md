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
    │   └── ui/             # Reusable atomic UI elements (Buttons, Inputs, etc.)
    ├── context/            # React Context state providers (ThemeContext, AgentContext)
    ├── hooks/              # Custom React Hooks (useIsMounted)
    ├── lib/                # Modular utilities and third-party clients
    │   ├── ai/             # Cognitive AI Gateway layer (providers, services, types)
    │   ├── memory/         # Local Memory System (types, storage, service, hooks, utils)
    │   ├── rag/            # Local RAG System (types, parsers, indexers, services, hooks, utils)
    │   └── tools/          # Tools Engine, Execution Pipeline, Agent Executor & Orchestrator
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

### 1. Architectural Highlights (`src/lib/tools/`)

We designed a fully decouplable, strongly-typed **Tools Engine** containing clean interfaces and services:

- **Type Domain (`src/lib/tools/types/index.ts`):** Defines standard schema attributes for `Tool`, `ToolCategory`, `ToolParameter`, `ToolExecution`, `ToolResult`, `ToolStatus`, `ToolCapability`, `ToolPermission`, and `ExecutionContext`.
- **Base Tool Interface (`src/lib/tools/base/BaseTool.ts`):** Defines abstract class `BaseTool` with built-in validator parsing and health status checks.
- **Tool Registry (`src/lib/tools/registry/ToolRegistry.ts`):** Handles register/remove/find, tracking of execution statistics, and automatic default tool registrations.
- **Tool Execution Service (`src/lib/tools/services/ToolExecutionService.ts`):** orchestrates run tasks, handles user role permission mapping, error captures, latency metrics, and supports configurable execution retries.
- **Execution Log Service (`src/lib/tools/services/ExecutionLogService.ts`):** Hydration-safe logging component that persists run outcomes in localStorage.

### 2. Mock Tool Connectors (`src/lib/tools/implementations/`)

We implemented 10 programmatically stable mock tools containing simulated execution runtimes:

1. **Python Sandbox Executor:** Simulates data frame statistical groupings.
2. **SQL Query Analyzer:** Translates inputs into relational tabular queries.
3. **Excel Workbook Integrator:** Recalculates formula metrics on spreadsheets.
4. **CSV Parser:** Slices and filters structured CSV data arrays.
5. **REST API Dispatcher:** Delivers mock GET/POST REST communications.
6. **High Precision Calculator:** Performs actual mathematical expressions evaluation.
7. **JSON Syntactical Structurer:** Minifies or prettifies JSON input variables.
8. **Cognitive Memory Retriever:** Interfaces directly with `MemoryService` context.
9. **RAG Document Locator:** Scans and matches knowledge chunks via `RetrievalService`.
10. **Google Web Search:** Simulates real-time search queries lookup.

### 3. Agent Executor & Multi-Agent Orchestrator

- **Agent Executor (`src/lib/tools/executor/AgentExecutor.ts`):** Combines the complete execution lifecycle. When a user sends a request, the executor:
  1. Queries relevant contextual facts from local Memory.
  2. Pulls knowledge references from local RAG documents.
  3. Forms a step plan heuristic (rule-based) of what tools are required.
  4. Runs the planned tools through the execution pipeline.
  5. Formulates and pipes the final consolidated context block through `AIService` to generate the final synthetic output.
- **Multi-Agent Orchestrator (`src/lib/tools/orchestrator/AgentOrchestrator.ts`):** Supports executing agents sequentially or in parallel, allowing downstream sharing of output context and logs aggregation.

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
