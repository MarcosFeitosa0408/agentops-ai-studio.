import { MemoryScope, MemoryCategory } from '../types';

export const formatScopeLabel = (scope: MemoryScope): string => {
  const mapping: Record<MemoryScope, string> = {
    conversation: 'Conversa',
    agent: 'Agente',
    project: 'Projeto',
    user: 'Usuário',
    global: 'Global',
  };
  return mapping[scope] || scope;
};

export const formatCategoryLabel = (category: MemoryCategory): string => {
  const mapping: Record<MemoryCategory, string> = {
    core_preference: 'Preferência Core',
    user_info: 'Dados do Usuário',
    context_history: 'Histórico de Contexto',
    semantic_fact: 'Fato Semântico',
    other: 'Outro',
  };
  return mapping[category] || category;
};

export const getScopeColor = (scope: MemoryScope): string => {
  const mapping: Record<MemoryScope, string> = {
    conversation: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    agent: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    project: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    user: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    global: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
  };
  return mapping[scope] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
};
