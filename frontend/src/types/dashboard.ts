// Dashboard types matching the API DTOs

import type { Task } from './task';
import type { Bill } from './bill';

export interface DashboardData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalJournalEntries: number;
  totalReceipts: number;
  totalBills: number;
  unpaidBills: number;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  recentTasks?: Task[];
  upcomingBills?: Bill[];
}
