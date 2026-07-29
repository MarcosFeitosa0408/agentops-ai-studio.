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
    │   └── ui/             # Reusable atomic UI elements (Buttons, Inputs, etc.)
    ├── context/            # React Context state providers (ThemeContext, AgentContext)
    ├── hooks/              # Custom React Hooks (useIsMounted)
    ├── lib/                # Modular utilities and third-party clients
    │   ├── ai/             # Cognitive AI Gateway layer (providers, services, types)
    │   ├── memory/         # Local Memory System (types, storage, service, hooks, utils)
    │   └── rag/            # Local RAG System (types, parsers, indexers, services, hooks, utils)
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

### 1. Memory System Architecture (`src/lib/memory/`)

The Memory system acts as the cognitive context cache for AI Agents. It differentiates between short-term (temporary conversation session data) and long-term (persistent facts) memories:

- **Storage Client (`MemoryStorage.ts`):** Direct hydration-safe interface interacting with browser `localStorage`. Implements standard CRUD operations, statistics compilation, and mock relevance scoring.
- **Service Layer (`MemoryService.ts`):** The single entry point for memory access. It manages cognitive stores, updates access counts, tracks timestamps, and formats retrieved memories into structured markdown blocks.
- **Unified Scopes:**
  - `conversation`: Local to the active chat session (short-term).
  - `agent`: Local to a specific specialized agent instance.
  - `project`: Local to the workspace's project scope.
  - `user`: Local to the active user's persistent preferences.
  - `global`: Broad, cross-workspace facts.

### 2. Retrieval-Augmented Generation (RAG) Architecture (`src/lib/rag/`)

RAG allows Agents to access offline knowledge bases and corporate documents during prompt execution:

- **Mock Document Parser (`DocumentParser.ts`):** Simulates textual extraction of various file formats (PDF, DOCX, TXT, Markdown, CSV, Excel, JSON). Automatically splits text into paragraphs/chunks with simulated page numbers, line offsets, and word counts.
- **Chunk Indexer (`ChunkIndexer.ts`):** Maintains the in-memory document metadata index. Implements keyword-matching search and calculates mock relevance scores based on query term frequency.
- **Retrieval Service (`RetrievalService.ts`):** Executes queries, ranks matched chunks, and formats source citations with document names, page pointers, and matching relevance scores.

### 3. Memory + AI Gateway Integration (`src/lib/ai/services/AIService.ts`)

Before any chat generation or stream is forwarded to the registered providers (OpenAI, Anthropic, Gemini, etc.), `AIService` intercepts the payload, extracts the last user query, and queries the local Memory and RAG Retrieval Services.

The relevant context blocks and source citations are formatted and appended transparently to the prompt payload, ensuring total contextual awareness:

```text
[User Message Content]
...
--- INFORMAÇÕES DE MEMÓRIA RECUPERADAS ---
[Memória Relacionada #1] (user/core_preference): "O usuário prefere explicações detalhadas de engenharia de sistemas..."
-----------------------------------------

--- CONTEXTO DE DOCUMENTOS DE CONHECIMENTO RECUPERADOS ---
[Documento Relacionado #1] "politica_lgpd.pdf" pág. 1 (Relevância: 85%): "O estúdio AgentOps AI Studio utiliza criptografia simétrica local..."
----------------------------------------------------
```

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
