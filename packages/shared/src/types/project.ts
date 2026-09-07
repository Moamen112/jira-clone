export interface Project {
  id: string;
  name: string;
  key: string; // e.g. "PROJ", "FIELD"
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
