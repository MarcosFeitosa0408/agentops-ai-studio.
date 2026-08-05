'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Plus,
  Trash2,
  Paperclip,
  Cpu,
  Database,
  Boxes,
  Folder,
  Clock,
  Sparkles,
  Play,
  CheckCircle,
  Zap,
} from 'lucide-react';

import { WorkerManager } from '@/workforce/WorkerManager';
import { AgentWorker } from '@/workforce/AgentWorker';
import { executeWorkerTask } from '@/workforce/WorkerExecution';
import { useWorkspace } from '@/context/WorkspaceContext';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { useIsMounted } from '@/hooks/useIsMounted';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { RouteProtection } from '@/components/security/RouteProtection';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  content: string;
  timestamp: string;
  workerId?: string;
  workerName?: string;
  workerAvatar?: string;
}

interface ChatConversation {
  id: string;
  title: string;
  workerId: string;
  messages: ChatMessage[];
  createdAt: string;
}

interface MultiAgentNode {
  id: string;
  role: string;
  agentName: string;
  avatar: string;
  task: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  durationMs?: number;
  log?: string;
}

const COLLABORATION_SEQUENCE: MultiAgentNode[] = [
  {
    id: 'node-ceo',
    role: 'CEO',
    agentName: 'Especialista de Estratégia',
    avatar: '👔',
    task: 'Definir Visão Estratégica do Produto',
    status: 'idle',
    log: 'Definição da visão executiva do produto: "Criar uma plataforma de e-commerce de ultra-alta performance em Next.js com WebAssembly para processamento de transações pesadas em milissegundos."',
  },
  {
    id: 'node-pm',
    role: 'Project Manager',
    agentName: 'Assistente Operacional',
    avatar: '📋',
    task: 'Mapear Backlog, Histórias & Sprints',
    status: 'idle',
    log: 'Histórias de usuário faturadas. Sprint backlog estruturado com 4 tarefas críticas: Ingestão de API Gateway, Estrutura de Tipos, Pipeline de Integração Contínua CI/CD, e Validação Heurística.',
  },
  {
    id: 'node-dev',
    role: 'Developer',
    agentName: 'Software Engineer Bot',
    avatar: '💻',
    task: 'Escrever Código Core TypeScript',
    status: 'idle',
    log: 'Implementando os microsserviços em TypeScript. Utilizado Next.js App Router com canais WebAssembly locais para otimização em runtime. Código limpo, modularizado e em compliance.',
  },
  {
    id: 'node-test',
    role: 'Tester',
    agentName: 'QA Automation Specialist',
    avatar: '🧪',
    task: 'Executar Suite de Testes Unitários',
    status: 'idle',
    log: 'Executando suite de testes automatizados Vitest. Foram cobertos 12 arquivos de tipos e 4 utilitários estruturados. Taxa de sucesso de 100% (16 testes unitários executados e aprovados).',
  },
  {
    id: 'node-rev',
    role: 'Reviewer',
    agentName: 'Code Quality Inspector',
    avatar: '🔍',
    task: 'Auditar Segurança & Padrões SOLID',
    status: 'idle',
    log: 'Código auditado estaticamente. Padrões DRY/SOLID aplicados corretamente. Nenhuma credencial ou chave de API exposta no repositório local. Código aprovado para merge na branch main.',
  },
  {
    id: 'node-doc',
    role: 'Documentation',
    agentName: 'Tech Writer Assistant',
    avatar: '📄',
    task: 'Exportar Manuais & Guias Técnicos',
    status: 'idle',
    log: 'Documentação técnica de microsserviços exportada para Notion. Guia do Desenvolvedor atualizado no README com instruções de build local, Dockerfile e variáveis de ambiente.',
  },
];

const PROMPT_SUGGESTIONS = [
  'Analisar planilha de custos fiscais em anexo',
  'Escrever query Postgres para faturamento por região',
  'Roteirizar cronograma AIDA de posts para LinkedIn',
  'Criar manual de onboarding para engenheiros TypeScript',
];

const AVAILABLE_PLUGINS = [
  { id: 'slack_connector', name: 'Slack' },
  { id: 'github_connector', name: 'GitHub' },
  { id: 'gmail_connector', name: 'Gmail' },
  { id: 'notion_connector', name: 'Notion' },
  { id: 'google_drive_connector', name: 'Google Drive' },
  { id: 'postgresql_connector', name: 'PostgreSQL' },
  { id: 'mysql_connector', name: 'MySQL' },
  { id: 'filesystem_connector', name: 'Filesystem' },
];

export default function ChatPage() {
  const isMounted = useIsMounted();
  const { toast } = useToast();
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'chat' | 'collab'>('chat');

  // Chat States
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Selector configs
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([]);
  const [memoryScope, setMemoryScope] = useState<'conversation' | 'agent' | 'global'>('conversation');

  // File Upload state
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Workforce workers list
  const [installedWorkers, setInstalledWorkers] = useState<AgentWorker[]>([]);

  // Collaboration state
  const [collabNodes, setCollabNodes] = useState<MultiAgentNode[]>(COLLABORATION_SEQUENCE);
  const [collabRunning, setCollabRunning] = useState(false);
  const [collabActiveIndex, setCollabActiveIndex] = useState<number>(-1);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Hydrate lists
  useEffect(() => {
    if (isMounted) {
      setTimeout(() => {
        const manager = WorkerManager.getInstance();
        const list = manager.getInstalled();
        setInstalledWorkers(list);

        if (list.length > 0) {
          setSelectedWorkerId(list[0].id);
        }

        // Hydrate Conversations from localStorage
        const stored = localStorage.getItem('agentops_chat_conversations_v1');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setConversations(parsed);
            if (parsed.length > 0) {
              setActiveConvId(parsed[0].id);
            }
          } catch {
            // fallback
          }
        } else {
          // Add default conversation
          const defaultConv: ChatConversation = {
            id: 'conv-default',
            title: 'Análise Exploratória Inicial',
            workerId: list[0]?.id || 'worker-1',
            messages: [
              {
                id: 'msg-1',
                sender: 'agent',
                content: `Olá! Eu sou o assistente digital **${list[0]?.name || 'Data Analyst'}**. Como posso ajudar na automatização das tarefas de negócios hoje? \n\nSinta-se à vontade para anexar arquivos CSV/Excel ou solicitar operações estruturadas!`,
                timestamp: new Date(Date.now() - 3600000).toISOString(),
              },
            ],
            createdAt: new Date().toISOString(),
          };
          setConversations([defaultConv]);
          setActiveConvId(defaultConv.id);
        }
      }, 0);
    }
  }, [isMounted]);

  // Sync conversations to LocalStorage
  useEffect(() => {
    if (isMounted && conversations.length > 0) {
      localStorage.setItem('agentops_chat_conversations_v1', JSON.stringify(conversations));
    }
  }, [conversations, isMounted]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConvId, streamingText]);

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  // Start new conversation thread
  const handleStartNewConversation = () => {
    const worker = installedWorkers.find((w) => w.id === selectedWorkerId) || installedWorkers[0];
    if (!worker) {
      toast('Nenhum Trabalhador', 'Instale um trabalhador no Marketplace primeiro para abrir uma conversa.', 'danger');
      return;
    }

    const newId = `conv-${Date.now()}`;
    const newConv: ChatConversation = {
      id: newId,
      title: `Discussão com ${worker.name}`,
      workerId: worker.id,
      messages: [
        {
          id: `msg-${Date.now()}-init`,
          sender: 'agent',
          content: `Iniciei uma nova seção de trabalho. Estou pré-configurado sob o escopo cognitivo **${worker.category}** com o modelo **${worker.llm}**. \n\nComo posso ajudar?`,
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newId);
    toast('Seção Iniciada', `Canal de chat com ${worker.name} criado.`, 'success');
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    if (activeConvId === id) {
      if (updated.length > 0) {
        setActiveConvId(updated[0].id);
      } else {
        setActiveConvId('');
      }
    }
    toast('Deletado', 'Discussão removida do histórico.', 'info');
  };

  // Run Prompt Execution
  const handleSendMessage = async (e?: React.FormEvent, presetText?: string) => {
    if (e) e.preventDefault();
    const textToSend = presetText || inputMessage;
    if (!textToSend.trim() || isStreaming || !activeConvId) return;

    setInputMessage('');

    // Append user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    // Update state
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvId) {
          // Set title on first custom message
          const updatedTitle = c.title === `Discussão com ${installedWorkers.find((w) => w.id === c.workerId)?.name}` || c.title.includes('Análise Exploratória')
            ? textToSend.substring(0, 28) + '...'
            : c.title;

          return {
            ...c,
            title: updatedTitle,
            messages: [...c.messages, userMsg],
          };
        }
        return c;
      }),
    );

    // Stream simulated response
    setIsStreaming(true);
    setStreamingText('');

    const activeWorker = installedWorkers.find((w) => w.id === (activeConversation?.workerId || selectedWorkerId));
    if (!activeWorker) {
      setIsStreaming(false);
      return;
    }

    try {
      // Execute under WorkerExecution to trigger logging and metrics routing!
      const execResult = await executeWorkerTask(activeWorker, textToSend, {
        workspaceId: activeWorkspace?.id,
      });

      // Simulated typing / streaming animation
      const responseContent = execResult.output || 'Processamento completo.';
      let typedText = '';
      const stepSize = Math.max(1, Math.floor(responseContent.length / 50));

      for (let i = 0; i < responseContent.length; i += stepSize) {
        typedText = responseContent.substring(0, i + stepSize);
        setStreamingText(typedText);
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      setStreamingText('');

      // Add final agent response to conversation
      const agentMsg: ChatMessage = {
        id: `msg-${Date.now()}-agent`,
        sender: 'agent',
        content: responseContent,
        timestamp: new Date().toISOString(),
        workerId: activeWorker.id,
        workerName: activeWorker.name,
        workerAvatar: activeWorker.avatar,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConvId) {
            return {
              ...c,
              messages: [...c.messages, agentMsg],
            };
          }
          return c;
        }),
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Fallback
      const errMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        sender: 'agent',
        content: `### Falha na Conexão Cognitiva\nOcorreu um erro ao despachar a tarefa para o trabalhador. Erro: ${msg}`,
        timestamp: new Date().toISOString(),
      };
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConvId) {
            return {
              ...c,
              messages: [...c.messages, errMsg],
            };
          }
          return c;
        }),
      );
    } finally {
      setIsStreaming(false);
    }
  };

  // File drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files: { name: string; size: string }[] = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        files.push({ name: file.name, size: `${sizeMb} MB` });
      }
      setUploadedFiles((prev) => [...prev, ...files]);
      toast('Arquivos Carregados', `${files.length} arquivos prontos para contexto do agente.`, 'success');
    }
  };

  // Trigger Multi-Agent sequence simulation
  const handleStartCollaboration = async () => {
    if (collabRunning) return;

    setCollabRunning(true);
    setCollabActiveIndex(0);

    // Reset sequence node statuses
    setCollabNodes(
      COLLABORATION_SEQUENCE.map((node) => ({
        ...node,
        status: 'idle',
        durationMs: undefined,
      })),
    );

    const stepLatency = [1200, 1500, 2200, 1600, 1400, 1100];

    for (let i = 0; i < COLLABORATION_SEQUENCE.length; i++) {
      setCollabActiveIndex(i);
      setCollabNodes((prev) =>
        prev.map((n, idx) => {
          if (idx === i) return { ...n, status: 'running' };
          return n;
        }),
      );

      // Simulated thinking and API triggers
      await new Promise((resolve) => setTimeout(resolve, stepLatency[i]));

      setCollabNodes((prev) =>
        prev.map((n, idx) => {
          if (idx === i) {
            return {
              ...n,
              status: 'completed',
              durationMs: stepLatency[i],
            };
          }
          return n;
        }),
      );
    }

    setCollabActiveIndex(-1);
    setCollabRunning(false);
    toast('Colaboração Finalizada', 'Grafo de execução concluído com 100% de compliance.', 'success');
  };

  // Rendering Markdown simply
  const renderMarkdown = (text: string) => {
    if (!text) return '';
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;
      let styleClass = 'text-sm mb-1 text-left';

      // Headers
      if (content.startsWith('### ')) {
        content = content.replace('### ', '');
        styleClass = 'text-base font-bold mt-3 mb-1 text-primary text-left';
      } else if (content.startsWith('#### ')) {
        content = content.replace('#### ', '');
        styleClass = 'text-sm font-bold mt-2 mb-1 text-text-primary text-left';
      } else if (content.startsWith('- ') || content.startsWith('* ')) {
        content = '• ' + content.substring(2);
        styleClass = 'text-sm pl-4 mb-0.5 text-text-secondary text-left';
      }

      // Safe bold parsing **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parsedElements: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parsedElements.push(content.substring(lastIndex, match.index));
        }
        parsedElements.push(
          <strong key={match.index} className="font-extrabold text-text-primary">
            {match[1]}
          </strong>,
        );
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < content.length) {
        parsedElements.push(content.substring(lastIndex));
      }

      return (
        <p key={idx} className={styleClass}>
          {parsedElements.length > 0 ? parsedElements : content}
        </p>
      );
    });
  };

  return (
    <RouteProtection>
      <WorkspaceLayout
        activePath="playground"
        title={activeTab === 'chat' ? 'Workspace de Chat Corporativo' : 'Multi-Agent Collaboration canvas'}
        breadcrumbs={[{ label: 'Automação' }, { label: 'Chat & Colaboração' }]}
        onCreateAgentClick={handleStartNewConversation}
      >
        <div className="max-w-7xl mx-auto space-y-6 text-left">
          {/* Tab Selector */}
          <div className="flex border-b border-border select-none">
            <button
              onClick={() => setActiveTab('chat')}
              className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all ${activeTab === 'chat' ? 'border-primary text-primary' : 'border-transparent text-text-secondary'}`}
            >
              Interactive Chat Workspace
            </button>
            <button
              onClick={() => setActiveTab('collab')}
              className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all ${activeTab === 'collab' ? 'border-primary text-primary' : 'border-transparent text-text-secondary'}`}
            >
              Multi-Agent Collaboration Canvas
            </button>
          </div>

          {/* TAB 1: INTERACTIVE CHAT WORKSPACE */}
          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-14rem)] min-h-[550px]">
              {/* Left Column: Sidebar History list */}
              <Card className="flex flex-col h-full border-border bg-card p-4 space-y-4">
                <div className="flex justify-between items-center border-b pb-3 border-border/50">
                  <span className="text-text-primary text-sm font-bold">Conversas Ativas</span>
                  <Button variant="ghost" size="xs" onClick={handleStartNewConversation}>
                    <Plus className="h-4.5 w-4.5" />
                  </Button>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto space-y-2 max-h-[220px] lg:max-h-none select-none">
                  {conversations.map((c) => {
                    const worker = installedWorkers.find((w) => w.id === c.workerId);
                    const isActive = c.id === activeConvId;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setActiveConvId(c.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-150 ${isActive ? 'bg-primary/10 border-primary/20 border text-text-primary font-bold' : 'bg-surface hover:bg-neutral-light border border-transparent text-text-secondary'}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0">{worker?.avatar || '🤖'}</span>
                          <div className="text-left min-w-0">
                            <p className="text-xs truncate font-semibold">{c.title}</p>
                            <p className="text-[10px] text-text-muted truncate">{worker?.name || 'Agente'}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteConversation(c.id, e)}
                          className="text-text-muted hover:text-red-500 opacity-60 hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                  {conversations.length === 0 && (
                    <p className="text-text-muted text-xs text-center py-6">Nenhuma seção iniciada.</p>
                  )}
                </div>

                {/* Prompt Suggestions History area */}
                <div className="border-t pt-4 border-border/50 space-y-2 select-none">
                  <span className="text-text-muted text-[10px] font-bold uppercase tracking-wider">Sugestões de Tarefas</span>
                  <div className="space-y-1.5">
                    {PROMPT_SUGGESTIONS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setInputMessage(p)}
                        className="w-full text-left p-2 bg-surface hover:bg-neutral-light border border-border/40 rounded-lg text-[10.5px] text-text-secondary truncate transition-all"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Drop area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-3 text-center transition-all flex flex-col justify-center items-center ${isDragging ? 'bg-primary/10 border-primary scale-102' : 'bg-surface border-border/50'}`}
                >
                  <Paperclip className="h-5 w-5 text-text-muted mb-1 animate-pulse" />
                  <span className="text-[10px] text-text-secondary block font-bold">Upload de Arquivos</span>
                  <span className="text-[9px] text-text-muted">Arraste CSV/Excel aqui</span>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-1.5 space-y-1 w-full text-left bg-neutral-light/50 p-1.5 rounded-md border text-[9px] text-text-primary">
                      {uploadedFiles.map((f, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="truncate max-w-[100px]">{f.name}</span>
                          <span className="text-primary font-semibold">{f.size}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Middle Section: Conversation Thread */}
              <Card className="lg:col-span-2 flex flex-col h-full border-border bg-card p-4 justify-between">
                {activeConversation ? (
                  <>
                    {/* Header info */}
                    <div className="border-b pb-3 border-border/50 flex items-center justify-between select-none">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl bg-neutral-light p-1.5 rounded-lg">
                          {installedWorkers.find((w) => w.id === activeConversation.workerId)?.avatar || '🤖'}
                        </span>
                        <div className="text-left">
                          <h4 className="text-text-primary text-xs font-bold">
                            {installedWorkers.find((w) => w.id === activeConversation.workerId)?.name || 'Agente'}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-success">
                            <span className="h-1 w-1 bg-success rounded-full animate-ping" />
                            Canal Seguro Ativo (SSL)
                          </span>
                        </div>
                      </div>

                      {/* Workspace badge */}
                      <span className="bg-primary/15 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                        <Folder className="h-3 w-3" />
                        {activeWorkspace?.name || 'Global'}
                      </span>
                    </div>

                    {/* Chat Area scroll */}
                    <div className="flex-1 overflow-y-auto py-4 space-y-4 px-2 max-h-[340px] lg:max-h-none">
                      {activeConversation.messages.map((m) => {
                        const isAgent = m.sender === 'agent';
                        return (
                          <div key={m.id} className={`flex gap-3 text-left ${isAgent ? 'justify-start' : 'justify-end'}`}>
                            {isAgent && (
                              <span className="text-xl bg-neutral-light/50 p-1 rounded-full h-8 w-8 flex items-center justify-center shrink-0 select-none">
                                {m.workerAvatar || '🤖'}
                              </span>
                            )}
                            <div className="max-w-[85%]">
                              <div className={`p-3.5 rounded-2xl border text-sm leading-relaxed ${isAgent ? 'bg-surface border-border text-text-primary rounded-tl-none' : 'bg-primary text-primary-foreground border-primary/20 rounded-tr-none shadow-sm'}`}>
                                {isAgent ? renderMarkdown(m.content) : <p className="text-sm font-semibold">{m.content}</p>}
                              </div>
                              <span className="text-[9px] text-text-muted block mt-1 px-1">
                                {new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Streaming Text display */}
                      {isStreaming && streamingText && (
                        <div className="flex gap-3 text-left justify-start">
                          <span className="text-xl bg-neutral-light/50 p-1 rounded-full h-8 w-8 flex items-center justify-center shrink-0 select-none animate-bounce">
                            {installedWorkers.find((w) => w.id === activeConversation.workerId)?.avatar || '🤖'}
                          </span>
                          <div className="max-w-[85%]">
                            <div className="p-3.5 rounded-2xl bg-surface border border-border text-text-primary rounded-tl-none animate-pulse">
                              {renderMarkdown(streamingText)}
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Form input */}
                    <form onSubmit={(e) => handleSendMessage(e)} className="border-t pt-3 border-border/50 flex gap-2">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Digite sua solicitação de automação..."
                        className="flex-1 px-4 py-2 bg-background border border-border rounded-xl text-sm placeholder:text-text-muted outline-none focus:border-primary"
                        disabled={isStreaming}
                      />
                      <Button variant="primary" size="md" type="submit" disabled={isStreaming} leftIcon={<Send className="h-4 w-4" />}>
                        Enviar
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 select-none">
                    <MessageSquare className="h-12 w-12 text-text-muted mb-3" />
                    <p className="text-text-primary text-sm font-bold">Nenhuma conversa selecionada</p>
                    <p className="text-text-muted text-xs mt-1">Selecione uma conversa ao lado ou clique no botão + para iniciar.</p>
                  </div>
                )}
              </Card>

              {/* Right Column: Context/Selectors configuration Panel */}
              <Card className="flex flex-col h-full border-border bg-card p-4 space-y-5 select-none text-left">
                <div className="flex items-center gap-2 border-b pb-3 border-border/50">
                  <Zap className="h-4.5 w-4.5 text-primary" />
                  <span className="text-text-primary text-sm font-bold">Configuração de Contexto</span>
                </div>

                {/* Workspace Selector */}
                <div className="space-y-1">
                  <span className="text-text-primary text-xs font-semibold flex items-center gap-1.5">
                    <Folder className="h-3.5 w-3.5 text-violet-500" />
                    Workspace Isolado
                  </span>
                  <Select
                    value={activeWorkspace?.id || ''}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => switchWorkspace(e.target.value)}
                    className="py-1 px-2.5 text-xs bg-surface border-border"
                  >
                    {workspaces.map((ws) => (
                      <option key={ws.id} value={ws.id}>{ws.name} ({ws.department})</option>
                    ))}
                  </Select>
                </div>

                {/* Worker selection */}
                <div className="space-y-1">
                  <span className="text-text-primary text-xs font-semibold flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-accent" />
                    Instância de IA
                  </span>
                  <Select
                    value={activeConversation?.workerId || selectedWorkerId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setSelectedWorkerId(e.target.value);
                      if (activeConversation) {
                        setConversations((prev) =>
                          prev.map((c) => (c.id === activeConvId ? { ...c, workerId: e.target.value } : c)),
                        );
                      }
                    }}
                    className="py-1 px-2.5 text-xs bg-surface border-border"
                  >
                    {installedWorkers.map((w) => (
                      <option key={w.id} value={w.id}>{w.avatar} {w.name}</option>
                    ))}
                  </Select>
                </div>

                {/* Memory context scope selector */}
                <div className="space-y-1">
                  <span className="text-text-primary text-xs font-semibold flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-indigo-500" />
                    Escopo Cognitivo (Memória)
                  </span>
                  <Select
                    value={memoryScope}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMemoryScope(e.target.value as 'conversation' | 'agent' | 'global')}
                    className="py-1 px-2.5 text-xs bg-surface border-border"
                  >
                    <option value="conversation">Apenas esta conversa</option>
                    <option value="agent">Memórias do Agente</option>
                    <option value="global">Contexto Global Studio</option>
                  </Select>
                  <p className="text-[10px] text-text-muted mt-1 leading-normal">
                    Filtra as chaves semânticas de RAG recuperadas durante a inferência.
                  </p>
                </div>

                {/* Active Plugins checklist */}
                <div className="space-y-2 border-t pt-4 border-border/40">
                  <span className="text-text-primary text-xs font-semibold flex items-center gap-1.5">
                    <Boxes className="h-3.5 w-3.5 text-emerald-500" />
                    Plugins MCP Ativos (Injetados)
                  </span>
                  <div className="grid grid-cols-1 gap-2 max-h-[140px] overflow-y-auto">
                    {AVAILABLE_PLUGINS.map((p) => {
                      const isChecked = selectedPlugins.includes(p.id) || (activeConversation && installedWorkers.find((w) => w.id === activeConversation.workerId)?.tools.includes(p.id));
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedPlugins((prev) =>
                              prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id],
                            );
                          }}
                          className={`flex items-center justify-between p-2 border rounded-xl text-[10px] text-left transition-all ${isChecked ? 'bg-primary/10 border-primary/30 text-text-primary font-bold' : 'bg-surface border-border/50 text-text-secondary'}`}
                        >
                          <span>{p.name} Connector</span>
                          <span className={`h-2 w-2 rounded-full ${isChecked ? 'bg-primary' : 'bg-transparent'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: MULTI-AGENT COLLABORATION CANVASES */}
          {activeTab === 'collab' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-5 rounded-xl border border-border">
                <div className="text-left space-y-1">
                  <h3 className="text-text-primary font-bold text-base flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Multi-Agent Pipeline Execution Graph
                  </h3>
                  <p className="text-text-secondary text-xs">
                    Inicie e audite a execução de um processo de ponta-a-ponta que encadeia a cognição e ferramentas de múltiplos trabalhadores.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Play className="h-4.5 w-4.5" />}
                  onClick={handleStartCollaboration}
                  isLoading={collabRunning}
                >
                  {collabRunning ? 'Executando Pipeline...' : 'Iniciar Cadeia de Colaboração'}
                </Button>
              </div>

              {/* Visually Renders Sequential Execution Graph */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left side: Visual timeline nodes */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 space-y-4">
                  <span className="text-[10px] text-primary font-bold uppercase tracking-wider block text-left">GRAFO DE EXECUÇÃO ATIVO</span>

                  <div className="relative pl-6 space-y-8 text-left border-l-2 border-border/60">
                    {collabNodes.map((node, index) => {
                      const isActive = index === collabActiveIndex;
                      const isCompleted = node.status === 'completed';
                      const isIdle = node.status === 'idle';

                      return (
                        <div key={node.id} className="relative group select-none">
                          {/* Dot indicator */}
                          <span className={`absolute -left-[31px] top-1 rounded-full h-4 w-4 border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-success border-success text-white' : isActive ? 'bg-primary border-primary animate-ping' : 'bg-surface border-border'}`} />

                          <span className={`absolute -left-[31px] top-1 rounded-full h-4 w-4 border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-success border-success' : isActive ? 'bg-primary border-primary' : 'bg-surface border-border'}`}>
                            {isCompleted && <CheckCircle className="h-2 w-2 text-white fill-white" />}
                          </span>

                          <div className={`p-4 border rounded-2xl transition-all ${isActive ? 'border-primary bg-primary/5 shadow-xs' : isCompleted ? 'border-success/30 bg-success/3' : 'border-border/60 bg-surface/30'}`}>
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                              <div className="flex items-center gap-2.5">
                                <span className="text-2xl">{node.avatar}</span>
                                <div>
                                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">{node.role}</h4>
                                  <p className="text-text-secondary text-xs">{node.task}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5">
                                {isCompleted && (
                                  <span className="text-[10px] text-success font-extrabold bg-success/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {node.durationMs}ms
                                  </span>
                                )}
                                {isActive && (
                                  <span className="text-[10px] text-primary font-extrabold bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
                                    Processando...
                                  </span>
                                )}
                                {isIdle && (
                                  <span className="text-[10px] text-text-muted font-extrabold bg-neutral-light/50 px-2 py-0.5 rounded-full">
                                    Pendente
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right side: Selected Node collapse outputs logs and compliance audity logs */}
                <div className="space-y-6">
                  <Card className="p-5 border-border bg-card text-left space-y-4">
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">LOGS DE TRANSAÇÃO DO PIPELINE</span>

                    <div className="space-y-4 max-h-[360px] overflow-y-auto">
                      {collabNodes.map((node, index) => {
                        const isCompleted = node.status === 'completed';
                        const isActive = index === collabActiveIndex;
                        return (
                          <div
                            key={node.id}
                            className={`p-3.5 border rounded-xl transition-all ${isCompleted ? 'border-border bg-surface' : isActive ? 'border-primary/30 bg-primary/3' : 'border-border/30 bg-surface/10 opacity-60'}`}
                          >
                            <div className="flex justify-between items-center text-[10px] font-bold border-b pb-1.5 border-border/30">
                              <span className="text-text-primary flex items-center gap-1">
                                <span>{node.avatar}</span>
                                <span>{node.role} LOG</span>
                              </span>
                              <span className={isCompleted ? 'text-success' : isActive ? 'text-primary animate-pulse' : 'text-text-muted'}>
                                {isCompleted ? 'COMPLETED' : isActive ? 'ACTIVE' : 'WAITING'}
                              </span>
                            </div>
                            <p className="text-[11px] text-text-secondary leading-relaxed pt-2 leading-normal">
                              {isCompleted || isActive ? node.log : 'Aguardando encadeamento anterior...'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  <Card className="p-4 bg-violet-500/5 border-violet-500/10 border text-left select-none">
                    <div className="flex items-center gap-2 text-violet-400 font-bold text-xs pb-1 border-b border-violet-500/15">
                      <CheckCircle className="h-4.5 w-4.5" />
                      COMPLIANCE AUDIT ENCRYPTED LOG
                    </div>
                    <p className="text-[10px] text-text-muted leading-relaxed mt-2.5 leading-normal">
                      Esta transação colaborativa automatizada foi devidamente assinada com a chave de compliance SHA-256 e gravada para auditorias futuras de IT do painel geral de governança.
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </WorkspaceLayout>
    </RouteProtection>
  );
}
