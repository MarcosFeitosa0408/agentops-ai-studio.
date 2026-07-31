import { TriggerType } from '../types';

export class TriggerService {
  private static instance: TriggerService;

  private constructor() {}

  public static getInstance(): TriggerService {
    if (!TriggerService.instance) {
      TriggerService.instance = new TriggerService();
    }
    return TriggerService.instance;
  }

  /**
   * Simulates/dispatches external webhook, scheduled or API trigger run cycles.
   */
  public async triggerMockEvent(
    type: TriggerType,
    payload: Record<string, unknown>,
  ): Promise<{ success: boolean; triggeredAt: string; payloadReceived: Record<string, unknown> }> {
    // Artificial latency delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      triggeredAt: new Date().toISOString(),
      payloadReceived: payload,
    };
  }

  public getSupportedTriggers(): { type: TriggerType; label: string; description: string }[] {
    return [
      {
        type: 'manual',
        label: 'Início Manual',
        description: 'Disparado pelo usuário via clique no estúdio.',
      },
      {
        type: 'scheduled',
        label: 'Cron Agendado',
        description: 'Executa em períodos recorrentes configurados via expressão cron.',
      },
      {
        type: 'webhook',
        label: 'Webhook HTTP',
        description: 'Dispara quando uma chamada POST HTTP externa é recebida.',
      },
      {
        type: 'file_upload',
        label: 'Envio de Arquivo',
        description: 'Executa quando novos arquivos são indexados na base RAG.',
      },
      {
        type: 'api_request',
        label: 'Requisição de API',
        description: 'Disparado por integrações e microserviços externos.',
      },
      {
        type: 'database_event',
        label: 'Evento de Banco',
        description: 'Disparado quando ocorrem atualizações em tabelas SQL monitoradas.',
      },
    ];
  }
}
export default TriggerService;
