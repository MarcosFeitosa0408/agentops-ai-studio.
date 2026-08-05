# Worker Builder Documentation

This document describes how to use and interact with the visual **Worker Builder** inside AgentOps AI Studio.

## Creating a Custom Worker

Navigate to `/workers` and select the **Criar Trabalhador** tab to open the builder.

### Fields and Controls

1. **Nome do Trabalhador:** Enter a unique title (e.g., "Analista Jurídico de Contratos").
2. **Descrição Executiva:** A brief summary explaining what the worker solves (e.g., "Verifica cláusulas de multas e reajustes...").
3. **Avatar Eletivo:** Pick an emoji from the available grid representing your agent.
4. **Categoria:** Classify under Analytics, Business, Marketing, Development, Sales, Operations, or Finance.
5. **Modelo de Linguagem (LLM):** Assign a cognitive LLM provider (Claude 3.5 Sonnet, GPT-4o Advanced, Llama 3.1, etc.).
6. **Temperatura Cognitiva:** A slider from `0.0` (analytical/deterministic) to `1.0` (creative/exploratory).
7. **Workflow Automatizado Padrão:** Bind the worker to run an automation flow from `WorkflowEngine` whenever triggered.
8. **Ferramentas (MCP Plugins):** Multi-select plugins (Slack, Notion, PostgreSQL, Filesystem, Google Drive, etc.) the agent can call.
9. **Permissões (RBAC):** Bind strict authorization permissions (Ler Workspace, Escrever Workspace, Chamar Conectores MCP, etc.).
10. **Knowledge Base:** Provide a comma-separated list of knowledge base domains.
11. **Instruções Heurísticas (System Prompt):** Design the system prompts guiding the core reasoning.

Clicking **Criar & Registrar Trabalhador** compiles, registers the worker in `WorkerManager`, and adds it to the local catalog.

## Managing Workers

From the **Mercado de IA** tab:
- **Toggle Enable/Disable:** Enable or pause workers using the switches.
- **Configure:** Opens an editing drawer allowing adjustments to LLMs, temperatures, tools, and instructions.
- **Duplicate:** Copies existing workers, giving a suffix `(Cópia)`.
- **Delete:** Safely removes custom workers.
