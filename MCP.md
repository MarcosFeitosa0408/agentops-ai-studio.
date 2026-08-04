# AgentOps AI Studio — Model Context Protocol (MCP) Integration

## Overview
AgentOps AI Studio implements the open-source **Model Context Protocol (MCP)** specification. This standards-based integration provides a secure, unified channel connecting our cognitive AI agents to external third-party software, file stores, and systems via standard JSON-RPC 2.0 communication.

---

## 1. Bidirectional Protocol Stack (`src/lib/mcp/`)
The MCP implementation contains four main layer blocks:

```
+------------------+                   +------------------+
|    McpClient     |                   |    McpServer     |
| (Manages tool    | <===============> | (Dispatches actions|
| executions &     |   Bidirectional   | from manifests & |
| session state)   |     Transport     | raw connections) |
+------------------+                   +------------------+
```

### A. Transport (`InMemoryMcpTransport.ts`)
A symmetric, asynchronous, memory-based transport bus simulating message queues. It passes protocol payloads between Client and Server instances with configurable artificial latency.

### B. Client (`McpClient.ts`)
Initiates handshakes, validates capabilities, registers servers, and coordinates requests. Includes a strict **10-second pending request timeout** safety handler.

### C. Server (`McpServer.ts`)
Listens to incoming connection handshakes, lists capabilities, and routes call queries based on standard protocols (`initialize`, `tools/list`, `tools/call`, `resources/list`, `resources/read`).

### D. Server Registry (`McpServerRegistry.ts`)
Manages and tracks active virtual MCP server processes globally in the browser.

---

## 2. Standard JSON-RPC 2.0 Payloads
All MCP sessions communicate using standardized JSON-RPC messages.

### Tool Listing Request:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

### Tool Execution Request:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "listIssues",
    "arguments": { "repo": "owner/repo" }
  }
}
```

---

## 3. Secret Manager Cryptography (`src/lib/mcp/SecretManager.ts`)
To protect third-party credentials (like GitHub PATs, Slack webhooks, and database keys), MCP integrates a centralized security vault:
- **AES-256-GCM Encryption:** Simulates secure Master Key symmetric encryption.
- **Provider Interface:** Built with swap-ready abstractions, allowing teams to trade local storage with production backends (such as AWS Secrets Manager or HashiCorp Vault).
- **Automated Decoupling:** Credentials are only decrypted inside the server runtime memory when dispatching an execution request, never leaking keys to client components.
