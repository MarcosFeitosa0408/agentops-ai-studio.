'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Wrench,
  Activity,
  CheckCircle,
  Play,
  Terminal,
  Database,
  Search,
  BookOpen,
  Calculator,
  Server,
  FileSpreadsheet,
  Braces,
  RefreshCw,
} from 'lucide-react';

import { WorkspaceLayout } from '../../components/workspace/WorkspaceLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { useToast } from '../../components/ui/Toast';
import { ToolRegistry } from '../../lib/tools/registry/ToolRegistry';
import { ToolExecutionService } from '../../lib/tools/services/ToolExecutionService';
import { ExecutionLogService } from '../../lib/tools/services/ExecutionLogService';
import { ExecutionHistory, ExecutionToolbar } from '../../components/tools/TimelineComponents';
import { ToolExecution, ToolCategory, ToolResult } from '../../lib/tools/types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Terminal,
  Database,
  Search,
  BookOpen,
  Calculator,
  Server,
  FileSpreadsheet,
  Braces,
};

interface ToolMeta {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  icon: string;
  enabled: boolean;
}

interface RegistryStats {
  totalTools: number;
  enabledCount: number;
  executionCounts: Record<string, number>;
  lastExecutions: Record<string, string>;
}

export default function ToolsManagerPage() {
  const { toast } = useToast();
  const [tools, setTools] = useState<ToolMeta[]>([]);
  const [stats, setStats] = useState<RegistryStats | null>(null);
  const [healthChecks, setHealthChecks] = useState<Record<string, { status: string; message?: string }>>({});
  const [executionLogs, setExecutionLogs] = useState<ToolExecution[]>([]);

  // Testing tool widget state
  const [testToolId, setTestToolId] = useState<string>('');
  const [testArguments, setTestArguments] = useState<string>('{\n  "expression": "250 * 4"\n}');
  const [testResult, setTestResult] = useState<ToolResult | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const getPlaceholderArgsForTool = useCallback((id: string): Record<string, unknown> => {
    switch (id) {
      case 'calculator_tool':
        return { expression: '150 * 5 + 25' };
      case 'python_tool':
        return { code: 'print("Running data analysis sandbox...")' };
      case 'sql_tool':
        return { query: "SELECT name, specialty FROM agents WHERE status = 'active'" };
      case 'rest_api_tool':
        return { url: 'https://api.agentops.ai/v1/health', method: 'GET' };
      case 'excel_tool':
        return { workbookPath: 'project_revenues.xlsx', range: 'Sheet1!A1:B5' };
      case 'csv_tool':
        return { filepath: 'agents_schedules.csv' };
      case 'memory_tool':
        return { query: 'insights de dados', limit: 2 };
      case 'rag_tool':
        return { query: 'normas de segurança da empresa', limit: 2 };
      case 'web_search_tool':
        return { query: 'AgentOps AI Release Notes 2025' };
      case 'json_tool':
        return { jsonString: '{"test": true, "nodes": [1,2,3]}', minify: false };
      default:
        return {};
    }
  }, []);

  // Load tools details
  const loadData = useCallback(() => {
    try {
      const registry = ToolRegistry.getInstance();
      const service = ToolExecutionService.getInstance();

      const list = registry.list().map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        description: t.description,
        icon: t.icon,
        enabled: t.enabled,
      }));
      setTools(list);

      const statistics = registry.statistics();
      setStats(statistics);

      setExecutionLogs(service.getLogs());

      if (list.length > 0 && !testToolId) {
        setTestToolId(list[0].id);
        const placeholderArgs = getPlaceholderArgsForTool(list[0].id);
        setTestArguments(JSON.stringify(placeholderArgs, null, 2));
      }
    } catch (err) {
      console.error(err);
    }
  }, [testToolId, getPlaceholderArgsForTool]);

  const runHealthChecks = useCallback(async () => {
    try {
      const registry = ToolRegistry.getInstance();
      const checks = await registry.healthCheck();
      setHealthChecks(checks);
      toast('Health Check Concluído', 'O status operacional de todos os conectores foi validado.', 'success');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      toast('Health Check Falhou', errMsg, 'danger');
    }
  }, [toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
      runHealthChecks();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData, runHealthChecks]);

  const handleTestToolSelectChange = (id: string) => {
    setTestToolId(id);
    const placeholder = getPlaceholderArgsForTool(id);
    setTestArguments(JSON.stringify(placeholder, null, 2));
  };

  const handleRunTest = async () => {
    if (!testToolId) return;
    setIsTesting(true);
    setTestResult(null);

    try {
      const parsedArgs = JSON.parse(testArguments) as Record<string, unknown>;
      const executionService = ToolExecutionService.getInstance();

      const res = await executionService.executeTool(testToolId, parsedArgs, {
        userId: 'admin-developer',
        memoryEnabled: false,
        ragEnabled: false,
        variables: {},
      });

      setTestResult(res);
      loadData(); // Reload stats and logs
      if (res.success) {
        toast('Execução Concluída', `Ferramenta ${testToolId} executada com sucesso.`, 'success');
      } else {
        toast('Erro na Execução', res.error || 'A ferramenta retornou uma falha.', 'warning');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      toast('Sintaxe Inválida', `Os argumentos devem ser um JSON válido. Erro: ${errMsg}`, 'danger');
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearHistoryLogs = () => {
    try {
      const logServiceModule = ExecutionLogService.getInstance();
      logServiceModule.clear();
      setExecutionLogs([]);
      loadData();
      toast('Logs Limpos', 'O histórico de execuções persistido localmente foi limpo.', 'info');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      toast('Falha ao Limpar Logs', errMsg, 'danger');
    }
  };

  const getToolMeta = (id: string) => {
    const t = tools.find((item) => item.id === id);
    if (!t) return undefined;
    return {
      name: t.name,
      category: t.category,
      icon: t.icon,
    };
  };

  return (
    <WorkspaceLayout
      activePath="tools"
      title="Gerenciador de Ferramentas & APIs"
      breadcrumbs={[{ label: 'Studio' }, { label: 'Ferramentas' }]}
    >
      <div className="max-w-7xl mx-auto space-y-8 select-none text-left animate-fade-in">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-text-muted uppercase">Total Ferramentas</span>
              <p className="text-2xl font-extrabold text-text-primary">{tools.length}</p>
            </div>
            <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
              <Wrench className="h-5 w-5" />
            </div>
          </Card>

          <Card className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-text-muted uppercase">Ativos / Habilitados</span>
              <p className="text-2xl font-extrabold text-success">
                {stats?.enabledCount || tools.length}
              </p>
            </div>
            <div className="bg-success/10 text-success p-2.5 rounded-xl">
              <CheckCircle className="h-5 w-5" />
            </div>
          </Card>

          <Card className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-text-muted uppercase">Total de Rodadas</span>
              <p className="text-2xl font-extrabold text-text-primary">{executionLogs.length}</p>
            </div>
            <div className="bg-indigo-500/10 text-indigo-500 p-2.5 rounded-xl">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
          </Card>

          <Card className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-text-muted uppercase">Conectores Operacionais</span>
              <p className="text-2xl font-extrabold text-primary">100%</p>
            </div>
            <div className="bg-amber-500/10 text-amber-500 p-2.5 rounded-xl">
              <RefreshCw className="h-5 w-5" />
            </div>
          </Card>
        </div>

        {/* Tools list and Test Execution Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of tools (Spans 2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-text-primary text-sm font-bold flex items-center gap-2">
                <Wrench className="h-4.5 w-4.5 text-primary" />
                Conectores de Recursos & Ferramentas
              </h3>
              <Button variant="outline" size="xs" onClick={runHealthChecks} leftIcon={<RefreshCw className="h-3 w-3" />}>
                Health Check Geral
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tools.map((t) => {
                const Icon = iconMap[t.icon] || Terminal;
                const health = healthChecks[t.id] || { status: 'healthy', message: 'Ready' };
                const isHealthy = health.status === 'healthy';
                const count = stats?.executionCounts?.[t.id] || 0;

                return (
                  <Card key={t.id} className="p-4.5 flex flex-col justify-between hover:border-primary/20 transition-all">
                    <div className="space-y-2.5 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded-xs uppercase tracking-wider">
                          {t.category}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase ${isHealthy ? 'text-success' : 'text-danger'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isHealthy ? 'bg-success' : 'bg-danger'}`} />
                          {health.status}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-neutral-light/50 border border-border p-2 rounded-lg text-text-secondary">
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-text-primary text-xs font-bold leading-tight">{t.name}</h4>
                          <p className="text-text-muted text-[10px] leading-none font-mono">{t.id}</p>
                        </div>
                      </div>

                      <p className="text-text-secondary text-xs line-clamp-2 leading-relaxed min-h-8">
                        {t.description}
                      </p>
                    </div>

                    <div className="border-t border-border/40 mt-4 pt-3 flex items-center justify-between text-[10px] text-text-muted">
                      <span>Execuções: <strong className="text-text-primary">{count}</strong></span>
                      <Button variant="ghost" size="xs" onClick={() => handleTestToolSelectChange(t.id)} className="text-primary hover:underline h-6 py-0 px-2">
                        Testar
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Test run and configs (Spans 1 column) */}
          <div className="space-y-4">
            <h3 className="text-text-primary text-sm font-bold flex items-center gap-2 px-1">
              <Play className="h-4.5 w-4.5 text-accent animate-pulse" />
              Execução de Teste do Conector
            </h3>

            <Card className="p-5 space-y-4 text-left">
              <Select
                label="Selecione a Ferramenta"
                value={testToolId}
                onChange={(e) => handleTestToolSelectChange(e.target.value)}
              >
                {tools.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </Select>

              <div className="space-y-1">
                <span className="text-text-primary text-xs font-semibold">Parâmetros Input (JSON)</span>
                <Textarea
                  value={testArguments}
                  onChange={(e) => setTestArguments(e.target.value)}
                  rows={4}
                  className="font-mono text-xs leading-relaxed bg-card"
                />
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full h-10 rounded-xl"
                onClick={handleRunTest}
                disabled={isTesting || !testToolId}
                leftIcon={isTesting ? <LoadingSpinner size="xs" /> : <Play className="h-4 w-4" />}
              >
                {isTesting ? 'Executando...' : 'Testar Ferramenta'}
              </Button>

              {/* Result render box */}
              {testResult && (
                <div className="pt-3 border-t border-border/40 space-y-1.5 animate-in fade-in duration-300">
                  <span className="text-[10px] font-bold text-text-muted uppercase">Resultado do Teste</span>
                  <div className={`p-3 rounded-lg text-xs font-mono max-h-48 overflow-y-auto leading-relaxed border ${testResult.success ? 'bg-success/5 border-success/20 text-success' : 'bg-danger/5 border-danger/20 text-danger'}`}>
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Execution Logs section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-text-primary text-sm font-bold flex items-center gap-2">
              <Terminal className="h-4.5 w-4.5 text-primary" />
              Histórico Consolidado de Execução de Ferramentas
            </h3>
            <Button variant="outline" size="xs" className="text-danger border-danger/10 bg-danger/5" onClick={handleClearHistoryLogs} disabled={executionLogs.length === 0}>
              Limpar Logs
            </Button>
          </div>

          <Card className="overflow-hidden">
            <ExecutionToolbar onRefresh={loadData} />
            <div className="p-4">
              <ExecutionHistory logs={executionLogs} getToolMeta={getToolMeta} />
            </div>
          </Card>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
