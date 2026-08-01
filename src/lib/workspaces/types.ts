export interface Workspace {
  id: string;
  name: string;
  description: string;
  department: string; // The department category to match and isolate agents (e.g., 'Finance', 'Marketing', 'Engineering')
  ownerId: string;
  members: string[]; // List of user IDs
  createdAt: string;
}
