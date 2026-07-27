'use client';

import React, { useState } from 'react';
import { Agent } from '@/types/agent';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';

interface AgentFormProps {
  initialData?: Agent;
  onSubmit: (data: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const AVAILABLE_MODELS = [
  'Claude 3.5 Sonnet (Default)',
  'GPT-4o Advanced',
  'GPT-4o Mini',
  'Llama 3.1 8B (Local)',
  'Llama 3.1 70B',
  'Gemini 1.5 Pro',
];

const SPECIALTIES = [
  'Data Science',
  'Database Operations',
  'Business Intelligence',
  'Finance',
  'Legal & Compliance',
  'Human Resources',
  'Marketing',
  'General Assistant',
];

export const AgentForm: React.FC<AgentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  // State for form fields initialized directly from initialData or defaults
  const [name, setName] = useState(initialData?.name || '');
  const [specialty, setSpecialty] = useState(initialData?.specialty || SPECIALTIES[0]);
  const [description, setDescription] = useState(initialData?.description || '');
  const [objective, setObjective] = useState(initialData?.objective || '');
  const [model, setModel] = useState(initialData?.model || AVAILABLE_MODELS[0]);
  const [temperature, setTemperature] = useState(initialData?.temperature ?? 0.4);
  const [systemPrompt, setSystemPrompt] = useState(initialData?.systemPrompt || '');
  const [status, setStatus] = useState<'active' | 'inactive'>(initialData?.status || 'active');

  // State for validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'O nome do agente é obrigatório.';
    } else if (name.trim().length < 3) {
      newErrors.name = 'O nome deve ter pelo menos 3 caracteres.';
    }

    if (!specialty.trim()) {
      newErrors.specialty = 'A especialidade do agente é obrigatória.';
    }

    if (!description.trim()) {
      newErrors.description = 'A descrição do agente é obrigatória.';
    } else if (description.trim().length < 10) {
      newErrors.description = 'A descrição deve ter pelo menos 10 caracteres.';
    }

    if (!objective.trim()) {
      newErrors.objective = 'O objetivo de negócio é obrigatório.';
    }

    if (!systemPrompt.trim()) {
      newErrors.systemPrompt = 'O prompt do sistema é obrigatório para guiar o agente.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        name: name.trim(),
        specialty,
        description: description.trim(),
        objective: objective.trim(),
        model,
        temperature,
        systemPrompt: systemPrompt.trim(),
        status,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SECTION 1: GENERAL INFO */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Nome do Agente *"
          placeholder="Ex: Especialista Financeiro"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          disabled={isSubmitting}
        />

        <Select
          label="Especialidade *"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          error={errors.specialty}
          disabled={isSubmitting}
        >
          {SPECIALTIES.map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </Select>
      </div>

      {/* SECTION 2: FUNCTIONAL DETAILS */}
      <div className="space-y-4">
        <Input
          label="Objetivo de Negócio *"
          placeholder="Ex: Automatizar a triagem de currículos para vagas técnicas"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          error={errors.objective}
          disabled={isSubmitting}
          helperText="O que este agente deve realizar de forma prioritária?"
        />

        <Textarea
          label="Descrição Resumida *"
          placeholder="Ex: Agente para triagem inteligente de perfis profissionais..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          disabled={isSubmitting}
          rows={3}
        />
      </div>

      {/* SECTION 3: LLM PARAMETERS */}
      <div className="border-border bg-neutral-light/20 rounded-xl border p-4.5 space-y-4">
        <h5 className="text-text-primary text-xs font-bold tracking-wider uppercase">
          Configurações de Modelo (Simulado)
        </h5>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Modelo do Provedor"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={isSubmitting}
          >
            {AVAILABLE_MODELS.map((mdl) => (
              <option key={mdl} value={mdl}>
                {mdl}
              </option>
            ))}
          </Select>

          {/* Temperature Range Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between select-none">
              <span className="text-text-primary text-sm font-medium">Temperatura</span>
              <span className="text-primary text-sm font-semibold">{temperature.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                disabled={isSubmitting}
                className="bg-border accent-primary h-1.5 w-full cursor-pointer rounded-lg appearance-none"
              />
            </div>
            <p className="text-text-muted text-[11px]">
              Valores mais baixos são precisos/determinísticos; altos são criativos.
            </p>
          </div>
        </div>

        <Textarea
          label="Prompt do Sistema (System Instructions) *"
          placeholder="Ex: Você é um Assistente Jurídico altamente preciso..."
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          error={errors.systemPrompt}
          disabled={isSubmitting}
          rows={5}
          helperText="Instruções fundamentais que ditam o comportamento e tom de resposta do agente."
        />
      </div>

      {/* STATUS TOGGLE */}
      <div className="border-border/60 flex items-center justify-between border-t pt-4">
        <Switch
          label={status === 'active' ? 'Agente Ativo (Pronto para Uso)' : 'Agente Inativo (Rascunho)'}
          checked={status === 'active'}
          onChange={() => setStatus((prev) => (prev === 'active' ? 'inactive' : 'active'))}
          disabled={isSubmitting}
        />

        {/* SUBMIT & ACTIONS */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            {initialData ? 'Salvar Alterações' : 'Criar Agente'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AgentForm;
