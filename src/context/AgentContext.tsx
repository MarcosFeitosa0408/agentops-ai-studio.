'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Agent } from '@/types/agent';
import { useToast } from '@/components/ui/Toast';
import { useIsMounted } from '@/hooks/useIsMounted';

export interface AgentContextProps {
  agents: Agent[];
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => Agent;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  duplicateAgent: (id: string) => void;
  toggleAgentStatus: (id: string) => void;
}

const AgentContext = createContext<AgentContextProps | undefined>(undefined);

export const INITIAL_MOCK_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    name: 'Analista de Dados',
    description: 'Especialista em análise exploratória de dados e modelagem estatística.',
    objective: 'Extrair insights valiosos de bases de dados complexas e gerar relatórios visuais.',
    specialty: 'Data Science',
    model: 'Claude 3.5 Sonnet (Default)',
    temperature: 0.2,
    systemPrompt: 'Você é um Analista de Dados sênior. Seu objetivo é ajudar a extrair relatórios estruturados e insights acionáveis com base em dados de vendas, marketing ou comportamento do usuário.',
    status: 'active',
    createdAt: '2025-02-10T10:00:00.000Z',
    updatedAt: '2025-02-28T14:30:00.000Z',
  },
  {
    id: 'agent-2',
    name: 'Especialista SQL',
    description: 'Otimizador de consultas de banco de dados e analista de queries complexas.',
    objective: 'Gerar, validar e otimizar queries SQL estruturadas para PostgreSQL, MySQL e BigQuery.',
    specialty: 'Database Operations',
    model: 'GPT-4o Advanced',
    temperature: 0.0,
    systemPrompt: 'Você é um Especialista em SQL. Analise os esquemas de tabela fornecidos pelo usuário e gere apenas código SQL otimizado, limpo e seguro, acompanhado de breves explicações das decisões técnicas.',
    status: 'active',
    createdAt: '2025-02-12T09:15:00.000Z',
    updatedAt: '2025-02-27T18:10:00.000Z',
  },
  {
    id: 'agent-3',
    name: 'Analista Financeiro',
    description: 'Agente focado em planejamento, análise de balanços corporativos e fluxo de caixa.',
    objective: 'Avaliar fluxos de caixa, calcular KPIs de lucratividade e projetar cenários de faturamento futuro.',
    specialty: 'Finance',
    model: 'Claude 3.5 Sonnet (Default)',
    temperature: 0.3,
    systemPrompt: 'Você é um Consultor Financeiro Corporativo. Ajude a estruturar análises financeiras, analisar balanços de DRE e projetar cenários de fluxo de caixa com base em dados históricos fornecidos pelo usuário.',
    status: 'inactive',
    createdAt: '2025-02-15T11:00:00.000Z',
    updatedAt: '2025-02-15T11:00:00.000Z',
  },
  {
    id: 'agent-4',
    name: 'Especialista Power BI',
    description: 'Arquiteto de relatórios visuais estruturados e fórmulas DAX complexas.',
    objective: 'Modelar dados para dashboards interativos do Power BI e escrever fórmulas DAX eficientes.',
    specialty: 'Business Intelligence',
    model: 'GPT-4o Advanced',
    temperature: 0.1,
    systemPrompt: 'Você é um Especialista em Power BI e DAX. Sua tarefa é fornecer soluções de modelagem de dados (star schema), estruturação de medidas DAX eficientes e sugestões de design visual para relatórios executivos.',
    status: 'active',
    createdAt: '2025-02-18T16:20:00.000Z',
    updatedAt: '2025-02-26T11:45:00.000Z',
  },
  {
    id: 'agent-5',
    name: 'Assistente Jurídico',
    description: 'Agente especializado em análise de contratos e conformidade regulatória.',
    objective: 'Revisar cláusulas contratuais, identificar potenciais riscos e resumir obrigações legais.',
    specialty: 'Legal & Compliance',
    model: 'Llama 3.1 70B',
    temperature: 0.1,
    systemPrompt: 'Você é um Assistente Jurídico virtual de alta precisão. Analise os contratos fornecidos em busca de brechas, prazos críticos, penalidades, obrigações financeiras ocultas e resuma os termos gerais de forma clara e profissional.',
    status: 'active',
    createdAt: '2025-02-20T14:00:00.000Z',
    updatedAt: '2025-02-25T15:20:00.000Z',
  },
  {
    id: 'agent-6',
    name: 'Especialista RH',
    description: 'Agente para triagem inteligente de currículos e desenvolvimento de processos de integração.',
    objective: 'Analisar perfis profissionais, triar candidatos ideais e desenhar jornadas de onboarding.',
    specialty: 'Human Resources',
    model: 'Claude 3.5 Sonnet (Default)',
    temperature: 0.5,
    systemPrompt: 'Você é um Consultor de Recursos Humanos sênior. Avalie currículos recebidos em comparação com a descrição de cargo fornecida, estruturando pontos fortes, áreas de desenvolvimento e sugerindo perguntas específicas para entrevistas de contratação.',
    status: 'inactive',
    createdAt: '2025-02-22T08:30:00.000Z',
    updatedAt: '2025-02-22T08:30:00.000Z',
  }
];

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_MOCK_AGENTS);
  const isMounted = useIsMounted();
  const { toast } = useToast();

  // Load from localStorage on mount (asynchronously to avoid react-hooks/set-state-in-effect)
  useEffect(() => {
    if (isMounted) {
      const stored = localStorage.getItem('agentops_agents');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setTimeout(() => {
            setAgents(parsed);
          }, 0);
        } catch (err) {
          console.error('Failed to parse agents from localStorage', err);
        }
      }
    }
  }, [isMounted]);

  // Sync to localStorage on update (only after mounted)
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('agentops_agents', JSON.stringify(agents));
    }
  }, [agents, isMounted]);

  const addAgent = (agentInput: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Agent => {
    const timestamp = new Date().toISOString();
    const newAgent: Agent = {
      ...agentInput,
      id: `agent-${Date.now()}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setAgents((prev) => [newAgent, ...prev]);
    toast('Agente Criado', `O agente "${newAgent.name}" foi criado com sucesso!`, 'success');
    return newAgent;
  };

  const updateAgent = (id: string, updates: Partial<Agent>) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === id
          ? { ...agent, ...updates, updatedAt: new Date().toISOString() }
          : agent,
      ),
    );
    const updated = agents.find((a) => a.id === id);
    if (updated) {
      toast('Agente Atualizado', `O agente "${updates.name || updated.name}" foi atualizado com sucesso!`, 'success');
    }
  };

  const deleteAgent = (id: string) => {
    const agentToDelete = agents.find((a) => a.id === id);
    setAgents((prev) => prev.filter((agent) => agent.id !== id));
    if (agentToDelete) {
      toast('Agente Excluído', `O agente "${agentToDelete.name}" foi removido do estúdio.`, 'warning');
    }
  };

  const duplicateAgent = (id: string) => {
    const original = agents.find((agent) => agent.id === id);
    if (!original) return;

    const timestamp = new Date().toISOString();
    const duplicated: Agent = {
      ...original,
      id: `agent-${Date.now()}`,
      name: `${original.name} (Cópia)`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setAgents((prev) => {
      const idx = prev.findIndex((agent) => agent.id === id);
      const next = [...prev];
      if (idx !== -1) {
        next.splice(idx + 1, 0, duplicated);
      } else {
        next.unshift(duplicated);
      }
      return next;
    });

    toast('Agente Duplicado', `O agente "${original.name}" foi duplicado.`, 'success');
  };

  const toggleAgentStatus = (id: string) => {
    setAgents((prev) =>
      prev.map((agent) => {
        if (agent.id === id) {
          const newStatus = agent.status === 'active' ? 'inactive' : 'active';
          toast(
            newStatus === 'active' ? 'Agente Ativado' : 'Agente Desativado',
            `O agente "${agent.name}" está agora ${newStatus === 'active' ? 'ativo' : 'inativo'}.`,
            'info',
          );
          return {
            ...agent,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return agent;
      }),
    );
  };

  return (
    <AgentContext.Provider
      value={{
        agents,
        addAgent,
        updateAgent,
        deleteAgent,
        duplicateAgent,
        toggleAgentStatus,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export const useAgents = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgents must be used within an AgentProvider');
  }
  return context;
};
