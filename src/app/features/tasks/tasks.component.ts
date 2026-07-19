import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../core/api/task.service';
import { QuestTaskList } from '../../core/models/task.model';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class TasksComponent implements OnInit {
  public taskService = inject(TaskService);
  
  public activeListId = signal<number | null>(null);
  
  public activeList = computed(() => {
    const lists = this.taskService.lists();
    const activeId = this.activeListId();
    return lists.find(l => l.id === activeId) || lists[0] || null;
  });

  public pendingTasks = computed(() => {
    const list = this.activeList();
    if (!list) return [];
    return list.tasks.filter(t => !t.isCompleted).sort((a, b) => {
      // Sort by Due Date (overdue first), then by CreatedAt
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      if (a.dueDate && b.dueDate) {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        if (dateA !== dateB) return dateA - dateB;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  });

  public completedTasks = computed(() => {
    const list = this.activeList();
    if (!list) return [];
    return list.tasks.filter(t => t.isCompleted);
  });

  // UI State
  public showCompleted = signal(false);
  public isAddingList = signal(false);
  public newListTitle = signal('');
  
  public isAddingTask = signal(false);
  public newTaskTitle = signal('');
  public newTaskDueDate = signal('');

  async ngOnInit() {
    await this.taskService.loadLists();
    
    // Auto-create "My Tasks" if no lists exist
    const lists = this.taskService.lists();
    if (lists.length === 0) {
      const newList = await this.taskService.createList('My Tasks');
      if (newList) {
        this.activeListId.set(newList.id);
      }
    } else {
      this.activeListId.set(lists[0].id);
    }
  }

  setActiveList(id: number) {
    this.activeListId.set(id);
    this.isAddingTask.set(false);
    this.showCompleted.set(false);
  }

  async saveNewList() {
    const title = this.newListTitle().trim();
    if (!title) {
      this.isAddingList.set(false);
      return;
    }

    const list = await this.taskService.createList(title);
    if (list) {
      this.activeListId.set(list.id);
    }
    this.newListTitle.set('');
    this.isAddingList.set(false);
  }
  
  deleteList(id: number) {
    if (confirm('Delete this list and all its tasks?')) {
      this.taskService.deleteList(id);
      if (this.activeListId() === id) {
        this.activeListId.set(null); // will fallback to first available list
      }
    }
  }

  async saveNewTask() {
    const title = this.newTaskTitle().trim();
    const listId = this.activeList()?.id;
    if (!title || !listId) {
      this.isAddingTask.set(false);
      return;
    }

    await this.taskService.createTask({
      questTaskListId: listId,
      name: title,
      dueDate: this.newTaskDueDate() || null
    });

    this.newTaskTitle.set('');
    this.newTaskDueDate.set('');
    // Keep isAddingTask true to add multiple
  }

  toggleTask(taskId: number) {
    const listId = this.activeList()?.id;
    if (listId) {
      this.taskService.toggleTask(taskId, listId);
    }
  }

  deleteTask(taskId: number) {
    const listId = this.activeList()?.id;
    if (listId) {
      this.taskService.deleteTask(taskId, listId);
    }
  }

  toggleCompletedSection() {
    this.showCompleted.update(v => !v);
  }
}
