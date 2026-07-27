'use client';

import React from 'react';
import { Agent } from '@/types/agent';
import { Modal } from '@/components/ui/Modal';
import { AgentForm } from './AgentForm';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Agent;
  onSubmit: (data: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  isSubmitting?: boolean;
}

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  isSubmitting = false,
}) => {
  const isEditing = !!initialData;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Configurações do Agente' : 'Criar Novo Agente de IA'}
      size="lg"
    >
      <div className="space-y-4">
        {!isEditing && (
          <p className="text-text-secondary text-sm">
            Configure as propriedades fundamentais do seu agente especializado para incluí-lo na equipe do estúdio.
          </p>
        )}
        <AgentForm
          key={initialData?.id || 'new'}
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </Modal>
  );
};

export default CreateAgentModal;
