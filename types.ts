export enum Role {
  ADMIN = 'ADMIN',
  LAWYER = 'LAWYER',
  INTERN = 'INTERN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  caseId?: string; // Optional link to a case
  assignedTo: string; // User ID
  dueDate: Date;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  comments: Comment[];
}

export interface Case {
  id: string;
  number: string;
  title: string;
  clientName: string;
  opposingParty: string;
  status: 'OPEN' | 'ARCHIVED' | 'SUSPENDED';
  responsibleLawyerId: string;
}

export interface Contact {
  id: string;
  name: string;
  type: 'CLIENT' | 'OPPOSING' | 'PARTNER';
  email: string;
  phone: string;
  notes?: string;
}

export type ViewState = 'DASHBOARD' | 'AGENDA' | 'CASES' | 'CONTACTS' | 'USERS';
