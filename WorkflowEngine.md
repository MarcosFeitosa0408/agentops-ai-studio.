# AgentOps AI Studio — Workflow Automation Engine

## Overview
The Workflow Automation Engine inside AgentOps AI Studio is designed to coordinate, run, and audit complex multi-step automated task flows. It translates visual Directed Acyclic Graphs (DAGs) representing systems, tools, conditions, and LLMs into safe, atomic executable pipelines.

---

## 1. Engine Core (`src/lib/workflows/engine/WorkflowEngine.ts`)
The `WorkflowEngine` is the orchestration controller managing:
- **Workspace State Hydration:** Saves and retrieves workflow layouts from persistent local stores.
- **Run Triggers:** Supports triggering workflows manually or through system configurations.
- **Log Aggregation:** Writes logs to `WorkflowLogService` compiling step statuses, latency, outputs, and the precise execution path.

---

## 2. Runner Execution Lifecycle (`src/lib/workflows/runner/WorkflowRunner.ts`)
The `WorkflowRunner` handles the step-by-step traversal:
1. **Initialize Execution State:** Sets up execution scopes, generating a unique execution ID and cloning initial variables.
2. **Determine Start Node:** Resolves the entry point trigger node.
3. **Execute Node Tasks:**
   - **Trigger Node:** Processes entry triggers.
   - **Delay Node:** Suspends execution thread for a configured duration.
   - **Agent Node:** Boots up an `AgentExecutor` task line, passing accumulated parameters to the agent.
   - **Tool Node:** Runs an individual `BaseTool` (e.g. SQL, Python, Excel).
   - **Condition Node:** Evaluates strict operators (`equals`, `not_equals`, `contains`, `greater_than`, `less_than`) on state variables.
4. **Branch Traversal:** Routes to downstream target nodes based on edge connection conditions.

---

## 3. Cyclic Loop Guard
To prevent runaway scripts, memory leaks, and infinite API loops, the `WorkflowRunner` employs a loop checker:
- **Visited Nodes Set:** Retains unique element IDs during the execution path.
- **Loop Counts threshold:** Evaluates node-level limits (defaulting to 3).
- **Cycle Interceptor:** If the same element is executed more than its allowed threshold, it halts the workflow and throws an error:
  `Error: Infinite cyclic feedback loop caught on Node: [Node Name]`

---

## 4. Example Diagram Definition
Workflows are represented as structured JSON entities containing nodes and connected edges:
```json
{
  "id": "wf-1",
  "name": "Automated SQL to Agent Flow",
  "nodes": [
    { "id": "node-start", "name": "Start Trigger", "type": "trigger", "position": { "x": 0, "y": 0 }, "config": {} },
    { "id": "node-sql", "name": "SQL Query", "type": "tool", "position": { "x": 100, "y": 100 }, "config": { "toolId": "sql_tool", "toolInput": { "query": "SELECT * FROM clients" } } },
    { "id": "node-condition", "name": "Has SaaS?", "type": "condition", "position": { "x": 200, "y": 200 }, "config": { "condition": { "variableName": "output_node-sql", "operator": "contains", "value": "SaaS" } } }
  ],
  "edges": [
    { "id": "e1", "source": "node-start", "target": "node-sql" },
    { "id": "e2", "source": "node-sql", "target": "node-condition" }
  ]
}
```
This diagram is visually parsed and animated on the Workflow Canvas in real-time.
