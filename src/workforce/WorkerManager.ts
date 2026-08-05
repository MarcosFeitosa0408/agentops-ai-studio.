import { AgentWorker, AgentWorkerConfig } from './AgentWorker';
import { WorkerHistoryEntry } from './WorkerHistory';

export const PRESET_WORKERS: AgentWorkerConfig[] = [
  {
    id: 'worker-1',
    name: 'Data Analyst',
    description: 'Especialista em processar grandes volumes de dados, identificar padrões e gerar relatórios executivos com insights acionáveis.',
    avatar: '📊',
    category: 'Analytics',
    permissions: ['workspace_read', 'data_analyze'],
    tools: ['filesystem_connector', 'postgresql_connector'],
    workflow: 'wf-1',
    status: 'idle',
    capabilities: ['Análise Exploratória de Dados (EDA)', 'Criação de Gráficos e Visualizações', 'Cálculos Estatísticos'],
    promptTemplate: 'Analise o seguinte conjunto de dados e gere um relatório detalhado focado em anomalias e KPIs de crescimento: {task}',
    suggestedWorkflows: ['Analyze CSV', 'Generate Dashboard'],
    rating: 4.9,
    installed: true,
    enabled: true,
    tags: ['Data', 'Python', 'KPIs'],
    instructions: 'Sempre formate números em moeda local ou formato científico quando apropriado. Forneça explicações passo a passo.',
    llm: 'Claude 3.5 Sonnet (Default)',
    temperature: 0.1,
    knowledgeBase: ['Padrões de Compliance Financeiro', 'Dicionário de Dados Corp'],
  },
  {
    id: 'worker-2',
    name: 'Business Analyst',
    description: 'Focado em mapear processos de negócios, levantar requisitos de produtos e realizar análises SWOT detalhadas.',
    avatar: '💼',
    category: 'Business',
    permissions: ['workspace_read', 'workspace_write'],
    tools: ['notion_connector', 'slack_connector'],
    status: 'idle',
    capabilities: ['Mapeamento de Processos (BPMN)', 'Análise de Negócios SWOT', 'Escrita de Histórias de Usuário'],
    promptTemplate: 'Como Analista de Negócios, avalie o seguinte cenário e elabore uma matriz SWOT completa com recomendações de ação: {task}',
    suggestedWorkflows: ['Weekly Report'],
    rating: 4.7,
    installed: true,
    enabled: true,
    tags: ['Business', 'Processos', 'SWOT'],
    instructions: 'Utilize terminologia corporativa profissional. Estruture as seções em Forças, Fraquezas, Oportunidades e Ameaças.',
    llm: 'GPT-4o Advanced',
    temperature: 0.2,
    knowledgeBase: ['Diretrizes do IIBA', 'Modelos de Requisitos'],
  },
  {
    id: 'worker-3',
    name: 'Marketing Assistant',
    description: 'Cria copies persuasivas para redes sociais, planeja campanhas de SEO e escreve e-mails de marketing de alta conversão.',
    avatar: '📣',
    category: 'Marketing',
    permissions: ['workspace_write'],
    tools: ['notion_connector', 'slack_connector'],
    status: 'idle',
    capabilities: ['Copywriting Persuasivo (AIDA)', 'Análise de Palavras-Chave SEO', 'Criação de Cronograma de Conteúdo'],
    promptTemplate: 'Crie uma estratégia de copy para a seguinte campanha utilizando o modelo AIDA (Atenção, Interesse, Desejo, Ação): {task}',
    suggestedWorkflows: ['Marketing Campaign'],
    rating: 4.8,
    installed: false,
    enabled: false,
    tags: ['Marketing', 'Copywriting', 'SEO'],
    instructions: 'Mantenha um tom engajador, dinâmico e amigável. Evite clichês exagerados de publicidade.',
    llm: 'Claude 3.5 Sonnet (Default)',
    temperature: 0.7,
  },
  {
    id: 'worker-4',
    name: 'Sales Assistant',
    description: 'Qualificação de leads frios, automação de e-mails outbound e enriquecimento de dados de CRM corporativos.',
    avatar: '💰',
    category: 'Sales',
    permissions: ['workspace_write'],
    tools: ['gmail_connector', 'slack_connector'],
    status: 'idle',
    capabilities: ['Qualificação de Leads (BANT)', 'Email Outreach Personalizado', 'Enriquecimento de Contatos'],
    promptTemplate: 'Qualifique o lead abaixo utilizando o framework BANT (Budget, Authority, Need, Timeline) e sugira um e-mail de abordagem personalizado: {task}',
    suggestedWorkflows: ['Weekly Report'],
    rating: 4.6,
    installed: false,
    enabled: false,
    tags: ['Sales', 'BANT', 'Outbound'],
    instructions: 'Foque em criar conexão imediata. Seja conciso e profissional em mensagens frias.',
    llm: 'GPT-4o Advanced',
    temperature: 0.4,
  },
  {
    id: 'worker-5',
    name: 'Financial Assistant',
    description: 'Analisa fluxo de caixa, projeta faturamentos mensais futuros e audita relatórios de conciliação de contas.',
    avatar: '📈',
    category: 'Finance',
    permissions: ['workspace_read', 'data_analyze'],
    tools: ['postgresql_connector', 'filesystem_connector'],
    status: 'idle',
    capabilities: ['Análise de Fluxo de Caixa', 'Projeção Financeira', 'Detecção de Desvios de Orçamento'],
    promptTemplate: 'Analise as entradas e saídas descritas e elabore um balancete simplificado de fluxo de caixa com projeção para o próximo trimestre: {task}',
    suggestedWorkflows: ['Analyze CSV'],
    rating: 4.8,
    installed: true,
    enabled: true,
    tags: ['Finance', 'Fluxo de Caixa', 'Orçamento'],
    instructions: 'A precisão numérica é mandatória. Aponte explicitamente discrepâncias maiores que 2%.',
    llm: 'GPT-4o Advanced',
    temperature: 0.0,
  },
  {
    id: 'worker-6',
    name: 'Customer Support',
    description: 'Suporte automatizado omnicanal de nível 1 em linguagem natural, geração de FAQs e análise de sentimento de reclamações.',
    avatar: '💬',
    category: 'Operations',
    permissions: ['workspace_read', 'workspace_write'],
    tools: ['slack_connector', 'gmail_connector'],
    status: 'idle',
    capabilities: ['Resolução de Tickets N1', 'Análise de Sentimento do Cliente', 'Geração Automática de FAQ'],
    promptTemplate: 'Responda ao cliente with empatia, resolvendo o problema de suporte ou escalando se necessário. Reclamação: {task}',
    suggestedWorkflows: ['Meeting Summary'],
    rating: 4.5,
    installed: false,
    enabled: false,
    tags: ['Support', 'N1', 'Empatia'],
    instructions: 'Seja extremamente empático, educado e paciente. Nunca compartilhe chaves de API ou segredos internos.',
    llm: 'Claude 3.5 Sonnet (Default)',
    temperature: 0.3,
  },
  {
    id: 'worker-7',
    name: 'Document Generator',
    description: 'Conversor de notas rascunhadas em PDFs profissionais estruturados e documentações técnicas limpas no Notion.',
    avatar: '📄',
    category: 'Productivity',
    permissions: ['workspace_write'],
    tools: ['notion_connector', 'filesystem_connector'],
    status: 'idle',
    capabilities: ['Estruturação de Manuais', 'Formatação Markdown Avançada', 'Geração de Resumos Executivos'],
    promptTemplate: 'Com base nas anotações fornecidas, crie um documento estruturado em Markdown utilizando cabeçalhos, listas e tabelas onde aplicável: {task}',
    suggestedWorkflows: ['Generate Documentation'],
    rating: 4.7,
    installed: true,
    enabled: true,
    tags: ['Docs', 'Markdown', 'Notion'],
    instructions: 'Siga rigorosamente a convenção de documentação corporativa da empresa.',
    llm: 'Claude 3.5 Sonnet (Default)',
    temperature: 0.3,
  },
  {
    id: 'worker-8',
    name: 'Meeting Assistant',
    description: 'Gera atas de reuniões consolidadas de áudios/transcrições e cria tarefas de acompanhamento automaticamente.',
    avatar: '🎙️',
    category: 'Productivity',
    permissions: ['workspace_write'],
    tools: ['gmail_connector', 'slack_connector'],
    status: 'idle',
    capabilities: ['Geração de Atas de Reunião', 'Extração de Plano de Ação', 'Distribuição de Tarefas via Slack'],
    promptTemplate: 'Resuma a transcrição de reunião a seguir, destacando os participantes, os pontos discutidos, as decisões tomadas e o plano de ação (com responsáveis): {task}',
    suggestedWorkflows: ['Meeting Summary'],
    rating: 4.8,
    installed: true,
    enabled: true,
    tags: ['Meeting', 'Ata', 'Slack'],
    instructions: 'Enumere as ações claramente usando tags [AÇÃO] com responsável destacado em negrito.',
    llm: 'Claude 3.5 Sonnet (Default)',
    temperature: 0.2,
  },
  {
    id: 'worker-9',
    name: 'Research Assistant',
    description: 'Varredura e compilação de pesquisas de mercado, análise de competidores diretos e checagem de fatos científicos.',
    avatar: '🔍',
    category: 'Productivity',
    permissions: ['workspace_read'],
    tools: ['google_drive_connector', 'notion_connector'],
    status: 'idle',
    capabilities: ['Benchmarking de Concorrentes', 'Revisão Sistemática de Literatura', 'Compilação de Relatórios Acadêmicos'],
    promptTemplate: 'Realize um levantamento bibliográfico ou análise concorrencial com base no tema fornecido: {task}',
    suggestedWorkflows: ['Generate Documentation'],
    rating: 4.9,
    installed: false,
    enabled: false,
    tags: ['Research', 'Mercado', 'Estudos'],
    instructions: 'Sempre cite fontes primárias ou descreva a metodologia de busca lógica adotada.',
    llm: 'Claude 3.5 Sonnet (Default)',
    temperature: 0.2,
  },
  {
    id: 'worker-10',
    name: 'Software Engineer',
    description: 'Revisão estática de códigos, refatoração de funções lentas e escrita de testes unitários automatizados em TypeScript.',
    avatar: '💻',
    category: 'Development',
    permissions: ['workspace_write'],
    tools: ['github_connector', 'filesystem_connector'],
    status: 'idle',
    capabilities: ['Refatoração de Código TypeScript/JS', 'Escrita de Testes Unitários (Vitest)', 'Debug de Erros de Runtime'],
    promptTemplate: 'Analise o seguinte trecho de código. Sugira uma versão refatorada e limpa acompanhada de testes unitários automatizados: {task}',
    suggestedWorkflows: ['Code Review'],
    rating: 4.9,
    installed: true,
    enabled: true,
    tags: ['Engineering', 'TypeScript', 'Tests'],
    instructions: 'Siga os princípios SOLID, DRY e mantenha os tipos de TypeScript estritamente definidos. Não use dynamic types.',
    llm: 'Claude 3.5 Sonnet (Default)',
    temperature: 0.1,
  },
  {
    id: 'worker-11',
    name: 'Prompt Engineer',
    description: 'Cria e refina prompts de sistema, estrutura templates com técnicas complexas como Few-Shot e Chain of Thought.',
    avatar: '✍️',
    category: 'Development',
    permissions: ['workspace_read'],
    tools: ['notion_connector'],
    status: 'idle',
    capabilities: ['Engenharia de Prompt de Sistema', 'Estruturação Few-Shot', 'Chain of Thought Prompting'],
    promptTemplate: 'Otimize o prompt do usuário a seguir, dividindo-o em Contexto, Instrução, Exemplos e Restrições: {task}',
    suggestedWorkflows: ['Code Review'],
    rating: 4.8,
    installed: false,
    enabled: false,
    tags: ['Prompt', 'Few-Shot', 'LLM'],
    instructions: 'Use marcadores XML ou JSON estruturado para orientar as respostas de agentes autônomos.',
    llm: 'Claude 3.5 Sonnet (Default)',
    temperature: 0.5,
  },
  {
    id: 'worker-12',
    name: 'SQL Expert',
    description: 'Otimização de performance de queries lentas, modelagem lógica de bancos relacionais e auditoria de índices.',
    avatar: '🛢️',
    category: 'Development',
    permissions: ['workspace_read', 'data_analyze'],
    tools: ['postgresql_connector', 'mysql_connector'],
    status: 'idle',
    capabilities: ['Otimização de Consultas SQL Complexas', 'Criação de Índices de Banco', 'Análise de Plano de Execução (EXPLAIN)'],
    promptTemplate: 'Analise o esquema da tabela e a query SQL a seguir e sugira uma versão otimizada com índices apropriados: {task}',
    suggestedWorkflows: ['SQL Analysis'],
    rating: 4.9,
    installed: true,
    enabled: true,
    tags: ['SQL', 'Postgres', 'Index'],
    instructions: 'Sempre forneça comentários explicando o plano de execução e o porquê de cada índice proposto.',
    llm: 'GPT-4o Advanced',
    temperature: 0.0,
  },
  {
    id: 'worker-13',
    name: 'Python Expert',
    description: 'Desenvolvimento de scripts de automação, manipulação de arquivos Excel/CSV via Pandas e scripts utilitários.',
    avatar: '🐍',
    category: 'Development',
    permissions: ['workspace_write', 'data_analyze'],
    tools: ['filesystem_connector'],
    status: 'idle',
    capabilities: ['Scripting Automatizado em Python', 'Manipulação de Pandas DataFrames', 'Web Scraping Seguro'],
    promptTemplate: 'Escreva um script Python limpo, modular e comentado que resolva o seguinte desafio: {task}',
    suggestedWorkflows: ['ETL Pipeline'],
    rating: 4.8,
    installed: true,
    enabled: true,
    tags: ['Python', 'Pandas', 'Automation'],
    instructions: 'Use sempre tratamento de erros robusto (try/except) e siga as diretrizes da PEP 8.',
    llm: 'Claude 3.5 Sonnet (Default)',
    temperature: 0.1,
  },
  {
    id: 'worker-14',
    name: 'ETL Specialist',
    description: 'Mapeamento de pipelines de ingestão de dados, sincronização de schemas e limpeza automatizada de registros nulos.',
    avatar: '🔄',
    category: 'Analytics',
    permissions: ['workspace_read', 'workspace_write', 'data_analyze'],
    tools: ['postgresql_connector', 'mysql_connector', 'filesystem_connector'],
    status: 'idle',
    capabilities: ['Sincronização de Esquemas (Schemas)', 'Limpeza e Higienização de Linhas', 'Pipeline de Ingestão CDC'],
    promptTemplate: 'Crie uma estratégia de transformação ETL para mapear os dados da origem para o destino especificado: {task}',
    suggestedWorkflows: ['ETL Pipeline'],
    rating: 4.7,
    installed: false,
    enabled: false,
    tags: ['ETL', 'Data Pipeline', 'Ingestão'],
    instructions: 'Foque na atomicidade das transações de carga de dados para evitar registros duplicados.',
    llm: 'GPT-4o Advanced',
    temperature: 0.1,
  },
  {
    id: 'worker-15',
    name: 'Dashboard Builder',
    description: 'Auxilia na prototipação e configuração de painéis de métricas em tempo real e visualizações analíticas de ponta a ponta.',
    avatar: '🖥️',
    category: 'Analytics',
    permissions: ['workspace_write'],
    tools: ['postgresql_connector', 'notion_connector'],
    status: 'idle',
    capabilities: ['Prototipagem de Painéis de Controle', 'Design de Widgets de KPIs', 'Fórmulas DAX e Agregações'],
    promptTemplate: 'Desenhe o layout lógico de um painel de controle executivo focado nos seguintes objetivos estratégicos de métricas: {task}',
    suggestedWorkflows: ['Generate Dashboard'],
    rating: 4.8,
    installed: true,
    enabled: true,
    tags: ['Dashboard', 'BI', 'KPIs'],
    instructions: 'Evite poluição visual. Proponha no máximo 6 widgets principais por visualização.',
    llm: 'GPT-4o Advanced',
    temperature: 0.2,
  },
];

export const READY_TO_USE_AUTOMATION_TEMPLATES = [
  {
    id: 'tmpl-1',
    name: 'Analyze CSV',
    description: 'Executa a ingestão completa de arquivos CSV estruturados, mapeia colunas de dados, extrai tendências de KPIs e formata um relatório analítico.',
    steps: ['Parse CSV File', 'Generate Summary Statistics', 'Generate Growth Insights Report'],
    category: 'Analytics',
    workerId: 'worker-1',
  },
  {
    id: 'tmpl-2',
    name: 'Generate Dashboard',
    description: 'Projeta e automatiza a exibição de métricas operacionais, extraindo dados de tabelas locais para gerar especificações JSON de widgets visuais.',
    steps: ['Fetch Schema Metadata', 'Consolidate Aggregated Metric Points', 'Render Dashboard Configuration'],
    category: 'Analytics',
    workerId: 'worker-15',
  },
  {
    id: 'tmpl-3',
    name: 'SQL Analysis',
    description: 'Analisa esquemas complexos de tabelas SQL, detecta queries lentas de faturamento e escreve índices otimizados de banco de dados.',
    steps: ['Parse SQL Query Statement', 'Verify Indexes & Table Partitions', 'Generate Plan & Explanations'],
    category: 'Development',
    workerId: 'worker-12',
  },
  {
    id: 'tmpl-4',
    name: 'Weekly Report',
    description: 'Consolida conquistas, gargalos operacionais e metas semanais da equipe do Notion para gerar um relatório executivo formal de negócios.',
    steps: ['Read Notion Document Blocks', 'Synthesize Business Performance KPIs', 'Log Weekly Executive Status Report'],
    category: 'Business',
    workerId: 'worker-2',
  },
  {
    id: 'tmpl-5',
    name: 'Marketing Campaign',
    description: 'Roteiriza uma estratégia multicanal de captação de clientes, escrevendo anúncios pagos para mídias sociais e cronogramas de disparo AIDA.',
    steps: ['Define Target Audience Persona', 'Generate AIDA Ad Script Copies', 'Publish Content Calendar to Notion Workspace'],
    category: 'Marketing',
    workerId: 'worker-3',
  },
  {
    id: 'tmpl-6',
    name: 'Meeting Summary',
    description: 'Varre e compila longas transcrições textuais de reuniões corporativas, gerando atas sumarizadas com responsáveis por tarefas do Slack.',
    steps: ['Parse Meeting Text Transcript', 'Formulate High-Level Summary & Decisions', 'Post Responsibility Matrix to Team Slack'],
    category: 'Productivity',
    workerId: 'worker-8',
  },
  {
    id: 'tmpl-7',
    name: 'Code Review',
    description: 'Audita repositórios estaticamente, verificando falhas de arquitetura de código, segurança de chaves, e escrevendo testes automatizados.',
    steps: ['Analyze TS/JS File Syntax AST', 'Report Security & Performance Vulnerabilities', 'Write Comprehensive Vitest Unit Tests'],
    category: 'Development',
    workerId: 'worker-10',
  },
  {
    id: 'tmpl-8',
    name: 'Generate Documentation',
    description: 'Estrutura manuais de onboarding de engenheiros e documentações de arquitetura técnica de microsserviços integrando páginas Notion.',
    steps: ['Read Source Markdown Specs', 'Re-organize Sections by Hierarchy Conventions', 'Create & Format Notion Docs Database Pages'],
    category: 'Productivity',
    workerId: 'worker-7',
  },
  {
    id: 'tmpl-9',
    name: 'ETL Pipeline',
    description: 'Executa jobs recorrentes de movimentação e higienização de registros corrompidos e sincroniza bases relacionais Postgres/MySQL.',
    steps: ['Extract Raw DB Records Input', 'Transform Types & Clean Invalid Nulls', 'Load & Upsert into Destination Schema Table'],
    category: 'Analytics',
    workerId: 'worker-14',
  },
];

export class WorkerManager {
  private static instance: WorkerManager;
  private WORKERS_KEY = 'agentops_workforce_workers_v1';
  private HISTORY_KEY = 'agentops_workforce_history_v1';

  private workers: AgentWorker[] = [];
  private history: WorkerHistoryEntry[] = [];
  private hydrated = false;

  private constructor() {
    this.hydrate();
  }

  public static getInstance(): WorkerManager {
    if (!WorkerManager.instance) {
      WorkerManager.instance = new WorkerManager();
    }
    return WorkerManager.instance;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private hydrate(): void {
    if (this.hydrated) return;
    this.hydrated = true;

    const browser = this.isBrowser();

    // History
    if (browser) {
      try {
        const storedHistory = localStorage.getItem(this.HISTORY_KEY);
        if (storedHistory) {
          this.history = JSON.parse(storedHistory);
        } else {
          this.history = this.getMockHistory();
          this.saveHistory();
        }
      } catch (err) {
        console.error('[WorkerManager] History hydration failure:', err);
        this.history = this.getMockHistory();
      }
    } else {
      this.history = this.getMockHistory();
    }

    // Workers
    if (browser) {
      try {
        const storedWorkers = localStorage.getItem(this.WORKERS_KEY);
        if (storedWorkers) {
          const parsed: AgentWorkerConfig[] = JSON.parse(storedWorkers);
          this.workers = parsed.map((config) => {
            const wHistory = this.history.filter((h) => h.workerId === config.id);
            return new AgentWorker(config, wHistory);
          });
        } else {
          this.workers = PRESET_WORKERS.map((config) => {
            const wHistory = this.history.filter((h) => h.workerId === config.id);
            return new AgentWorker(config, wHistory);
          });
          this.saveWorkers();
        }
      } catch (err) {
        console.error('[WorkerManager] Workers hydration failure:', err);
        this.workers = PRESET_WORKERS.map((config) => {
          const wHistory = this.history.filter((h) => h.workerId === config.id);
          return new AgentWorker(config, wHistory);
        });
      }
    } else {
      this.workers = PRESET_WORKERS.map((config) => {
        const wHistory = this.history.filter((h) => h.workerId === config.id);
        return new AgentWorker(config, wHistory);
      });
    }
  }

  private saveWorkers(): void {
    if (!this.isBrowser()) return;
    try {
      const serialized = this.workers.map((w) => w.toJSON());
      localStorage.setItem(this.WORKERS_KEY, JSON.stringify(serialized));
    } catch (err) {
      console.error('[WorkerManager] Save workers failure:', err);
    }
  }

  private saveHistory(): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.history));
    } catch (err) {
      console.error('[WorkerManager] Save history failure:', err);
    }
  }

  private getMockHistory(): WorkerHistoryEntry[] {
    return [
      {
        id: 'hist-1',
        workerId: 'worker-1',
        workerName: 'Data Analyst',
        task: 'Análise exploratória do arquivo vendas_faturamento_q1.csv',
        status: 'completed',
        startedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        completedAt: new Date(Date.now() - 3600000 * 4 + 4500).toISOString(),
        durationMs: 4500,
        output: '### Análise Q1 Finalizada\n- Total de vendas identificadas: R$ 145.200,00.\n- Região Sul representa 42% do faturamento total.\n- Recomendações: Aumentar o budget de marketing digital da campanha local em 10%.',
        steps: [
          { name: 'Parse CSV File', status: 'completed', durationMs: 1500 },
          { name: 'Generate Summary Statistics', status: 'completed', durationMs: 1200 },
          { name: 'Generate Growth Insights Report', status: 'completed', durationMs: 1800 },
        ],
      },
      {
        id: 'hist-2',
        workerId: 'worker-12',
        workerName: 'SQL Expert',
        task: 'Otimizar query SELECT * FROM orders JOIN order_items ...',
        status: 'completed',
        startedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        completedAt: new Date(Date.now() - 3600000 * 24 + 1800).toISOString(),
        durationMs: 1800,
        output: '### Query Otimizada\n- Adicionado índice composto em `orders(customer_id, status)`.\n- Query reescrita para evitar subconsultas correlacionadas.\n- Tempo de execução estimado reduzido de 2.4s para 15ms.',
        steps: [
          { name: 'Parse SQL Query Statement', status: 'completed', durationMs: 400 },
          { name: 'Verify Indexes & Table Partitions', status: 'completed', durationMs: 800 },
          { name: 'Generate Plan & Explanations', status: 'completed', durationMs: 600 },
        ],
      },
    ];
  }

  // --- PUBLIC API ---

  public list(): AgentWorker[] {
    this.hydrate();
    return this.workers;
  }

  public getInstalled(): AgentWorker[] {
    return this.list().filter((w) => w.installed);
  }

  public getMarketplace(): AgentWorker[] {
    return this.list();
  }

  public find(id: string): AgentWorker | undefined {
    this.hydrate();
    return this.workers.find((w) => w.id === id);
  }

  public getHistory(): WorkerHistoryEntry[] {
    this.hydrate();
    return this.history;
  }

  public getHistoryByWorker(workerId: string): WorkerHistoryEntry[] {
    this.hydrate();
    return this.history.filter((h) => h.workerId === workerId);
  }

  public createCustom(configInput: Omit<AgentWorkerConfig, 'id' | 'status' | 'rating' | 'installed' | 'enabled'>): AgentWorker {
    const newConfig: AgentWorkerConfig = {
      ...configInput,
      id: `worker-custom-${Date.now()}`,
      status: 'idle',
      rating: 5.0,
      installed: true,
      enabled: true,
    };

    const newWorker = new AgentWorker(newConfig);
    this.workers.unshift(newWorker);
    this.saveWorkers();
    return newWorker;
  }

  public updateConfig(id: string, updates: Partial<AgentWorkerConfig>): AgentWorker {
    this.workers = this.workers.map((w) => {
      if (w.id === id) {
        const raw = w.toJSON();
        const merged = { ...raw, ...updates };
        return new AgentWorker(merged, w.executionHistory);
      }
      return w;
    });
    this.saveWorkers();
    const updated = this.find(id);
    if (!updated) throw new Error('Worker not found after config update');
    return updated;
  }

  public duplicate(id: string): AgentWorker {
    const original = this.find(id);
    if (!original) throw new Error('Worker to duplicate not found');

    const config = original.toJSON();
    const duplicatedConfig: AgentWorkerConfig = {
      ...config,
      id: `worker-dup-${Date.now()}`,
      name: `${config.name} (Cópia)`,
      installed: true,
      enabled: true,
      status: 'idle',
    };

    const duplicated = new AgentWorker(duplicatedConfig);
    this.workers.unshift(duplicated);
    this.saveWorkers();
    return duplicated;
  }

  public install(id: string): void {
    this.updateConfig(id, { installed: true, enabled: true });
  }

  public uninstall(id: string): void {
    this.updateConfig(id, { installed: false, enabled: false });
  }

  public toggleEnable(id: string): void {
    const w = this.find(id);
    if (w) {
      this.updateConfig(id, { enabled: !w.enabled });
    }
  }

  public deleteCustom(id: string): boolean {
    const len = this.workers.length;
    this.workers = this.workers.filter((w) => w.id !== id);
    this.saveWorkers();
    return this.workers.length < len;
  }

  public addHistoryEntry(entry: WorkerHistoryEntry): void {
    this.history.unshift(entry);
    if (this.history.length > 200) {
      this.history = this.history.slice(0, 200);
    }
    this.saveHistory();

    // Sincronizar com o histórico em memória do trabalhador correspondente
    const w = this.find(entry.workerId);
    if (w) {
      w.executionHistory.unshift(entry);
    }
  }

  public clearHistory(): void {
    this.history = [];
    this.saveHistory();
    this.workers.forEach((w) => {
      w.executionHistory = [];
    });
  }

  public getTemplates() {
    return READY_TO_USE_AUTOMATION_TEMPLATES;
  }

  // Helper method for unit tests to force re-hydration
  public resetHydration(): void {
    this.hydrated = false;
    this.hydrate();
  }
}
export default WorkerManager;
