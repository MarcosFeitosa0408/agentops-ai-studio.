export interface Agent {
  id: string;
  name: string;
  description: string;
  objective: string;
  specialty: string;
  model: string;
  temperature: number;
  systemPrompt: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}
