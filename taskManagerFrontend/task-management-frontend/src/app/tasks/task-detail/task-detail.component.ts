import { Component, type OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { MatDialog } from "@angular/material/dialog"
import { MatSnackBar } from "@angular/material/snack-bar"
import { TaskService } from "../../core/services/task.service"
import { type TaskResponse, TaskStatus, type StatusUpdateRequest } from "../../core/models/task.model"
import { TaskFormComponent } from "../task-form/task-form.component"
import { AuthService } from "../../auth/services/auth.service"
import { type UserResponse, UserRole } from "../../auth/models/auth.models"
import { finalize } from "rxjs/operators"
import { ConfirmDialogComponent } from "src/app/shared/components/confirm-dialog/confirm-dialog.component"

@Component({
  selector: "app-task-detail",
  templateUrl: "./task-detail.component.html",
  styleUrls: ["./task-detail.component.scss"],
})
export class TaskDetailComponent implements OnInit {
  taskId!: number
  task: TaskResponse | null = null
  loading = false
  currentUser: UserResponse | null = null
  taskStatuses = Object.values(TaskStatus)

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user
    })

    this.route.paramMap.subscribe((params) => {
      const id = params.get("id")
      if (id) {
        this.taskId = +id
        this.loadTaskData()
      } else {
        this.router.navigate(["/tasks"])
      }
    })
  }

  loadTaskData(): void {
    this.loading = true

    this.taskService
      .getTaskById(this.taskId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (task) => {
          this.task = task
          console.log("Task loaded:", task)
          // Check if workEnvironment exists
          if (!task.workEnvironment) {
            console.warn("Task has no workEnvironment property")
          }
        },
        error: (error) => {
          console.error("Error loading task data", error)
          this.snackBar.open("Failed to load task data", "Close", { duration: 5000 })
          this.router.navigate(["/tasks"])
        },
      })
  }

  openEditForm(): void {
    if (!this.task) {
      console.error("No task available for editing")
      return
    }

    console.log("Opening edit form for task:", this.task)

    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: "600px",
      maxWidth: "90vw",
      data: {
        mode: "edit", // Add explicit mode
        task: this.task,
        workEnvironmentId: this.task.workEnvironment?.id,
      },
    })

    dialogRef.afterClosed().subscribe((result) => {
      console.log("Dialog closed with result:", result)
      if (result) {
        this.loadTaskData()
        this.snackBar.open("Task updated successfully", "Close", { duration: 3000 })
      }
    })
  }

  updateTaskStatus(status: TaskStatus): void {
    if (!this.task) return

    this.loading = true

    const statusUpdate: StatusUpdateRequest = { status }

    this.taskService
      .updateTaskStatus(this.task.id, statusUpdate)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (updatedTask) => {
          this.task = updatedTask
          this.snackBar.open(`Task status updated to ${status}`, "Close", { duration: 3000 })
        },
        error: (error) => {
          console.error("Error updating task status", error)
          this.snackBar.open("Failed to update task status", "Close", { duration: 5000 })
        },
      })
  }

  progressTask(): void {
    if (!this.task) return

    this.loading = true

    this.taskService
      .progressTask(this.task.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (updatedTask) => {
          this.task = updatedTask
          this.snackBar.open("Task progressed to next status", "Close", { duration: 3000 })
        },
        error: (error) => {
          console.error("Error progressing task", error)
          this.snackBar.open("Failed to progress task", "Close", { duration: 5000 })
        },
      })
  }

  confirmDelete(): void {
    if (!this.task) return

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "400px",
      data: {
        title: "Confirm Delete",
        message: `Are you sure you want to delete task "${this.task.title}"?`,
        confirmText: "Delete",
        cancelText: "Cancel",
        color: "warn",
      },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteTask()
      }
    })
  }

  deleteTask(): void {
    if (!this.task) return

    this.loading = true

    this.taskService
      .deleteTask(this.task.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.snackBar.open(`Task "${this.task?.title}" deleted successfully`, "Close", { duration: 3000 })
          this.router.navigate(["/tasks"])
        },
        error: (error) => {
          console.error("Error deleting task", error)
          this.snackBar.open("Failed to delete task", "Close", { duration: 5000 })
        },
      })
  }

  canManageTask(): boolean {
    if (!this.currentUser || !this.task) return false

    // Admins can manage all tasks
    if (this.currentUser.role === UserRole.ADMIN) return true

    // Department managers can manage tasks in their department
    if (
      this.currentUser.role === UserRole.DEPARTMENT_MANAGER &&
      this.task.workEnvironment?.department?.id === this.currentUser.department?.id
    ) {
      return true
    }

    // Users can manage tasks in their work environments
    if (this.task.workEnvironment?.user?.id === this.currentUser.id) return true

    return false
  }

  getStatusColor(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO:
        return "#ff9800"
      case TaskStatus.PENDING:
        return "#2196f3"
      case TaskStatus.DONE:
        return "#4caf50"
      default:
        return "#757575"
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case "HIGH":
        return "#f44336"
      case "MEDIUM":
        return "#ff9800"
      case "LOW":
        return "#4caf50"
      default:
        return "#757575"
    }
  }

  getNextStatus(): TaskStatus | null {
    if (!this.task) return null

    switch (this.task.status) {
      case TaskStatus.TODO:
        return TaskStatus.PENDING
      case TaskStatus.PENDING:
        return TaskStatus.DONE
      default:
        return null
    }
  }
}
