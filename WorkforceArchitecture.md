# Workforce Architecture

This document describes the architectural layout of the Business AI Workforce module introduced in Sprint 11.

## System Block Diagram

```
                 [ User Interface ]
             (Marketplace, Chat, Dashboard)
                           |
                           v
                    [ WorkerManager ] <--------+
                           |                   | (Persists State)
                           v                   v
                    [ AgentWorker ] <---> [ WorkerMemory ] ---> [ MemoryService ]
                           |
                           v
                 [ WorkerExecution ] ---> [ AIService ] (LLM Gateway)
                           |
                           +------------> [ StandardizedLoggingService ]
                           |
                           +------------> [ MonitoringService ]
```

## Core Modules & Responsibility Layer

### 1. `AgentWorker.ts`
Represents the structural model of a digital worker. Holds metadata properties: name, description, avatar icon, category, and configuration settings (LLM choice, temperature, prompt template, tools, and default workflow). Possesses a dedicated `WorkerMemory` interface.

### 2. `WorkerManager.ts`
The orchestrator singleton of the workforce. Discovers and hydrates preset templates. Saves user workers in the browser `localStorage`. Exposes marketplace actions (Install, Enable/Disable, Configure, Duplicate, Delete).

### 3. `WorkerScheduler.ts`
Enables cron-scheduled jobs (Interval/Simulated). Holds task lists and manages automated execution triggers at defined intervals.

### 4. `WorkerExecution.ts`
The executive runtime of the workers.
- Receives worker instance, user instruction, and options.
- Fetches relevant long-term memory contexts using `WorkerMemory`.
- Formulates a system message.
- Routes execution either through the `WorkflowEngine` (if a default workflow is bound) or directly to the multi-LLM `AIService` gateway.
- Fires compliance audits via `StandardizedLoggingService` and records latencies via `MonitoringService`.

### 5. `WorkerMemory.ts`
Encapsulates localized worker memories. Interfaces with `MemoryService` using the `agent` scope and `agentId` filters to store context history logs and semantic fact-retrievals.

### 6. `WorkerStatus.ts`
Type definitions indicating worker execution states (`'idle' | 'running' | 'paused' | 'failed' | 'completed' | 'cancelled'`).

### 7. `WorkerHistory.ts`
History entry schemas that log tasks, execution durations, step breakdown completion states, outputs, and any errors.
