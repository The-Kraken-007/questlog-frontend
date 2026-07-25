import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QuestTaskList, QuestTask, CreateQuestTaskListCommand, CreateQuestTaskCommand } from '../models/task.model';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../toast';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  // State
  private _lists = signal<QuestTaskList[]>([]);
  public lists = this._lists.asReadonly();
  public loading = signal<boolean>(false);

  async loadLists(): Promise<void> {
    this.loading.set(true);
    try {
      const lists = await firstValueFrom(this.http.get<QuestTaskList[]>('/api/tasklists'));
      this._lists.set(lists);
    } catch (error) {
      // Error toast handled globally by errorInterceptor
    } finally {
      this.loading.set(false);
    }
  }

  async createList(name: string): Promise<QuestTaskList | null> {
    try {
      const result = await firstValueFrom(
        this.http.post<{ id: number }>('/api/tasklists', { name })
      );
      const newList: QuestTaskList = { id: result.id, name, sortOrder: 999, tasks: [] };
      this._lists.update(l => [...l, newList]);
      return newList;
    } catch (error) {
      // Error toast handled globally by errorInterceptor
      return null;
    }
  }

  async deleteList(id: number): Promise<void> {
    // Optimistic UI
    const prevLists = this._lists();
    this._lists.update(l => l.filter(x => x.id !== id));
    
    try {
      await firstValueFrom(this.http.delete(`/api/tasklists/${id}`));
      this.toast.success('List deleted');
    } catch (error) {
      this._lists.set(prevLists); // Revert on failure; toast handled globally by errorInterceptor
    }
  }

  async createTask(command: CreateQuestTaskCommand): Promise<void> {
    try {
      const result = await firstValueFrom(
        this.http.post<{ id: number }>('/api/tasks', command)
      );
      const newTask: QuestTask = {
        id: result.id,
        questTaskListId: command.questTaskListId,
        name: command.name,
        dueDate: command.dueDate,
        isCompleted: false,
        createdAt: new Date().toISOString()
      };
      
      this._lists.update(lists => lists.map(list => {
        if (list.id === command.questTaskListId) {
          return { ...list, tasks: [...list.tasks, newTask] };
        }
        return list;
      }));
    } catch (error) {
      // Error toast handled globally by errorInterceptor
    }
  }

  async toggleTask(taskId: number, listId: number): Promise<void> {
    // Optimistic UI update
    this._lists.update(lists => lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          tasks: list.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t)
        };
      }
      return list;
    }));

    try {
      await firstValueFrom(this.http.patch(`/api/tasks/${taskId}/toggle`, {}));
    } catch (error) {
      // Revert optimism if failed
      this._lists.update(lists => lists.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            tasks: list.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t)
          };
        }
        return list;
      }));
      // Error toast handled globally by errorInterceptor
    }
  }

  async deleteTask(taskId: number, listId: number): Promise<void> {
    // Optimistic UI
    const prevLists = this._lists();
    this._lists.update(lists => lists.map(list => {
      if (list.id === listId) {
        return { ...list, tasks: list.tasks.filter(t => t.id !== taskId) };
      }
      return list;
    }));

    try {
      await firstValueFrom(this.http.delete(`/api/tasks/${taskId}`));
      this.toast.success('Task deleted');
    } catch (error) {
      this._lists.set(prevLists); // Revert; toast handled globally by errorInterceptor
    }
  }
}
