/**
 * Strongly typed Note interface for Experiment E08
 */
export interface Note {
  id: string;
  text: string;
  createdAt: number;
  updatedAt: number;
}

export type NoteSortOrder = 'newest' | 'oldest';
