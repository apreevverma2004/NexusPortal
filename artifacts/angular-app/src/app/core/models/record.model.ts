export type RecordStatus = 'pending' | 'in-progress' | 'completed' | 'rejected';
export type RecordPriority = 'low' | 'medium' | 'high' | 'critical';
export type AccessLevel = 'public' | 'restricted' | 'confidential';

export interface DataRecord {
  id: number;
  title: string;
  category: string;
  status: RecordStatus;
  priority: RecordPriority;
  owner: string;
  department: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  accessLevel: AccessLevel;
}

export interface RecordsResponse {
  records: DataRecord[];
  total: number;
  userRole: string;
  delayApplied: number;
}
