'use client';

import React from 'react';
import { Search, SlidersHorizontal, Plus, Grid, List } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface AgentToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  specialtyFilter: string;
  onSpecialtyFilterChange: (specialty: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  onCreateClick?: () => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

const SPECIALTIES = [
  { value: 'all', label: 'Todas Especialidades' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'Database Operations', label: 'Database Operations' },
  { value: 'Business Intelligence', label: 'Business Intelligence' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Legal & Compliance', label: 'Legal & Compliance' },
  { value: 'Human Resources', label: 'Human Resources' },
];

export const AgentToolbar: React.FC<AgentToolbarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  specialtyFilter,
  onSpecialtyFilterChange,
  sortBy,
  onSortByChange,
  onCreateClick,
  viewMode = 'grid',
  onViewModeChange,
}) => {
  return (
    <div className="border-border bg-card rounded-xl border p-4 shadow-xs space-y-4">
      {/* Top row: Search, View Mode, Create Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Pesquisar agentes por nome ou palavra-chave..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            leftElement={<Search className="h-4 w-4 text-text-muted" />}
          />
        </div>

        <div className="flex items-center justify-between gap-3 shrink-0">
          {/* View mode buttons */}
          {onViewModeChange && (
            <div className="bg-neutral-light/50 border-border rounded-lg border p-1 flex items-center gap-1 select-none">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`rounded-md p-1.5 cursor-pointer transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-surface text-primary shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                aria-label="Ver em grade"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`rounded-md p-1.5 cursor-pointer transition-colors ${
                  viewMode === 'list'
                    ? 'bg-surface text-primary shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                aria-label="Ver em lista"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          )}

          {onCreateClick && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={onCreateClick}
            >
              Criar Agente
            </Button>
          )}
        </div>
      </div>

      {/* Bottom row: Filters & Sorting */}
      <div className="border-border/40 flex flex-col gap-3 border-t pt-3.5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filtros:</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-4 flex-1">
          {/* Status Filter */}
          <div className="sm:w-44">
            <Select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="py-1 h-9 text-xs"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Apenas Ativos</option>
              <option value="inactive">Apenas Inativos</option>
            </Select>
          </div>

          {/* Specialty Filter */}
          <div className="sm:w-52">
            <Select
              value={specialtyFilter}
              onChange={(e) => onSpecialtyFilterChange(e.target.value)}
              className="py-1 h-9 text-xs"
            >
              {SPECIALTIES.map((spec) => (
                <option key={spec.value} value={spec.value}>
                  {spec.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Sort dropdown */}
          <div className="sm:ml-auto sm:w-56">
            <Select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="py-1 h-9 text-xs"
            >
              <option value="updated">Última Atualização</option>
              <option value="created">Data de Criação</option>
              <option value="name_asc">Nome (A-Z)</option>
              <option value="name_desc">Nome (Z-A)</option>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentToolbar;
