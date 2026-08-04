# AgentOps AI Studio — Memory & RAG Engines

## Overview
AgentOps AI Studio features a sophisticated cognitive storage stack combining a **Multi-Scope Memory Engine** and a **Retrieval-Augmented Generation (RAG)** pipeline. This allows agents to retain context across conversations, learn persistent user preferences, and query internal corporate documents.

---

## 1. Multi-Scope Memory Engine (`src/lib/memory/`)
Memory is designed as a unified system that handles short-term context and long-term habits.

### A. Memory Scopes
Memory is segregated across 5 distinct organizational scopes:
- **Conversation:** Volatile state tracking specific to a single chat thread.
- **Agent:** Custom instructions and operational directives assigned to an agent.
- **Project:** Operational milestones, factual data, and plans related to a project.
- **User:** Persistent settings, formats, and design preferences of the user.
- **Global:** General organization facts, compliance policies, and system settings.

### B. Memory Storage Driver (`MemoryStorage.ts`)
Hydration-safe store persisted in browser `localStorage`.
- **Search & Scoring:** Searches memory elements using a scoring algorithm. Complete matches yield `1.0`, prefix matches `0.9`, containment matches `0.75`, and matching metadata tags `0.8`.
- **Analytics Statistics:** Computes total memory count, accesses, and scope distributions.

---

## 2. Retrieval-Augmented Generation (RAG) Engine (`src/lib/rag/`)
The RAG pipeline provides context injection based on files uploaded to the Knowledge Base.

### A. Document Parsers (`parsers/DocumentParser.ts`)
Simulates parsing of various raw file structures:
- **PDF:** Extracts paragraphs, indexes pages, and segments text chunk structures.
- **DOCX:** Extracts table models and sections.
- **Markdown:** Parses headers and structured lists.

### B. Chunk Indexer (`indexers/ChunkIndexer.ts`)
Indexes parsed document segments into chunks, appending page metadata, character length, and file ownership fields.

### C. Retrieval Service (`services/RetrievalService.ts`)
The orchestrator executing:
- **Keyword Retrieval:** Scans chunk indices for match hits.
- **Re-Ranking:** Ranks results descending by relevance.
- **Context Generation:** Constructs structured system blocks to inject matching excerpts:
  `\n--- CONTEXTO DE DOCUMENTOS DE CONHECIMENTO RECUPERADOS ---\n[Documento Relacionado #1] "politica_lgpd.pdf" (Relevância: 85%): "..."\n----------------------------------------------------\n`
