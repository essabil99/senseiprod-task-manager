import { Component, type OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { MatDialog } from "@angular/material/dialog"
import { MatSnackBar } from "@angular/material/snack-bar"
import { WorkEnvironmentService } from "../../core/services/work-environment.service"
import { TaskService } from "../../core/services/task.service"
import type { WorkEnvironmentResponse } from "../../core/models/work-environment.model"
import { type TaskResponse, TaskStatus } from "../../core/models/task.model"
import { ConfirmDialogComponent } from "../../shared/components/confirm-dialog/confirm-dialog.component"
import { WorkEnvironmentFormComponent } from "../work-environment-form/work-environment-form.component"
import { TaskFormComponent } from "../../tasks/task-form/task-form.component"
import { AuthService } from "../../auth/services/auth.service"
import { type UserResponse, UserRole } from "../../auth/models/auth.models"
import { finalize, forkJoin, of } from "rxjs"
import { catchError } from "rxjs/operators"

@Component({
  selector: "app-work-environment-detail",
  templateUrl: "./work-environment-detail.component.html",
  styleUrls: ["./work-environment-detail.component.scss"],
})
export class WorkEnvironmentDetailComponent implements OnInit {
  workEnvironmentId!: number
  workEnvironment: WorkEnvironmentResponse | null = null
  tasks: TaskResponse[] = []
  loading = false
  currentUser: UserResponse | null = null

  // Expose TaskStatus enum to the template
  TaskStatus = TaskStatus

  tasksByStatus: Record<TaskStatus, TaskResponse[]> = {
    [TaskStatus.TODO]: [],
    [TaskStatus.PENDING]: [],
    [TaskStatus.DONE]: [],
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workEnvironmentService: WorkEnvironmentService,
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
        this.workEnvironmentId = +id
        this.loadWorkEnvironmentData()
      } else {
        this.router.navigate(["/work-environments"])
      }
    })
  }

  loadWorkEnvironmentData(): void {
    this.loading = true

    forkJoin({
      workEnvironment: this.workEnvironmentService.getWorkEnvironmentById(this.workEnvironmentId),
      tasks: this.taskService.getTasksByWorkEnvironmentId(this.workEnvironmentId).pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (results) => {
          this.workEnvironment = results.workEnvironment
          this.tasks = results.tasks
          this.groupTasksByStatus()
        },
        error: (error) => {
          console.error("Error loading work environment data", error)
          this.snackBar.open("Failed to load work environment data", "Close", { duration: 5000 })
          this.router.navigate(["/work-environments"])
        },
      })
  }

  groupTasksByStatus(): void {
    // Reset task groups
    this.tasksByStatus = {
      [TaskStatus.TODO]: [],
      [TaskStatus.PENDING]: [],
      [TaskStatus.DONE]: [],
    }

    // Group tasks by status
    this.tasks.forEach((task) => {
      if (task.status in this.tasksByStatus) {
        this.tasksByStatus[task.status].push(task)
      }
    })
  }

  openEditForm(): void {
    if (!this.workEnvironment) return

    const dialogRef = this.dialog.open(WorkEnvironmentFormComponent, {
      width: "600px",
      data: { workEnvironment: this.workEnvironment },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadWorkEnvironmentData()
      }
    })
  }

  openTaskForm(task?: TaskResponse): void {
    if (!this.workEnvironment) return

    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: "600px",
      data: {
        task,
        workEnvironmentId: this.workEnvironment.id,
      },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadWorkEnvironmentData()
      }
    })
  }

  confirmDelete(): void {
    if (!this.workEnvironment) return

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "400px",
      data: {
        title: "Confirm Delete",
        message: `Are you sure you want to delete work environment "${this.workEnvironment.name}"?`,
        confirmText: "Delete",
        cancelText: "Cancel",
        color: "warn",
      },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteWorkEnvironment()
      }
    })
  }

  deleteWorkEnvironment(): void {
    if (!this.workEnvironment) return

    this.loading = true

    this.workEnvironmentService
      .deleteWorkEnvironment(this.workEnvironment.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.snackBar.open(`Work environment "${this.workEnvironment?.name}" deleted successfully`, "Close", {
            duration: 3000,
          })
          this.router.navigate(["/work-environments"])
        },
        error: (error) => {
          console.error("Error deleting work environment", error)
          this.snackBar.open("Failed to delete work environment", "Close", { duration: 5000 })
        },
      })
  }

  canManageWorkEnvironment(): boolean {
    if (!this.currentUser || !this.workEnvironment) return false

    // Admins can manage all work environments
    if (this.currentUser.role === UserRole.ADMIN) return true

    // Department managers can manage work environments in their department
    if (
      this.currentUser.role === UserRole.DEPARTMENT_MANAGER &&
      this.workEnvironment.department?.id === this.currentUser.department?.id
    ) {
      return true
    }

    // Users can manage their own work environments
    if (this.workEnvironment.user?.id === this.currentUser.id) return true

    return false
  }
}
