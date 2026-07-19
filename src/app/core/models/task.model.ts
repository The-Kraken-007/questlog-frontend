export interface QuestTask {
  id: number;
  questTaskListId: number;
  name: string;
  dueDate: string | null;
  isCompleted: boolean;
  createdAt: string;
}

export interface QuestTaskList {
  id: number;
  name: string;
  sortOrder: number;
  tasks: QuestTask[];
}

export interface CreateQuestTaskListCommand {
  name: string;
}

export interface CreateQuestTaskCommand {
  questTaskListId: number;
  name: string;
  dueDate: string | null;
}
