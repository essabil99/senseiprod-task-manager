import { Component, type OnInit, Inject } from "@angular/core"
import { FormBuilder, type FormGroup, Validators } from "@angular/forms"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { MatSnackBar } from "@angular/material/snack-bar"
import { TaskService } from "../../core/services/task.service"
import { WorkEnvironmentService } from "../../core/services/work-environment.service"
import { type TaskRequest, type TaskUpdateRequest, type TaskResponse, TaskPriority } from "../../core/models/task.model"
import type { WorkEnvironmentResponse } from "../../core/models/work-environment.model"
import { AuthService } from "../../auth/services/auth.service"
import { type UserResponse, UserRole } from "../../auth/models/auth.models"
import { finalize } from "rxjs/operators"

interface DialogData {
  mode?: string // 'edit' or 'create'
  task?: TaskResponse
  workEnvironmentId?: number
}

@Component({
  selector: "app-task-form",
  templateUrl: "./task-form.component.html",
  styleUrls: ["./task-form.component.scss"],
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup
  loading = false
  loadingData = false
  isEditMode = false
  workEnvironments: WorkEnvironmentResponse[] = []
  taskPriorities = Object.values(TaskPriority)
  currentUser: UserResponse | null = null;
data: any

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private workEnvironmentService: WorkEnvironmentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogData,
  ) {
    console.log("TaskFormComponent initialized with data:", this.dialogData)

    // Check for edit mode using either the mode property or presence of task
    this.isEditMode = this.dialogData.mode === "edit" || !!this.dialogData.task

    this.taskForm = this.fb.group({
      title: ["", [Validators.required, Validators.maxLength(200)]],
      description: ["", Validators.maxLength(1000)],
      priority: [TaskPriority.MEDIUM, Validators.required],
      dueDate: [""],
      workEnvironmentId: ["", Validators.required],
    })

    // Populate form if editing
    if (this.isEditMode && this.dialogData.task) {
      console.log("Populating form with task data:", this.dialogData.task)
      this.taskForm.patchValue({
        title: this.dialogData.task.title,
        description: this.dialogData.task.description,
        priority: this.dialogData.task.priority,
        dueDate: this.dialogData.task.dueDate ? new Date(this.dialogData.task.dueDate) : null,
        workEnvironmentId: this.dialogData.task.workEnvironment?.id,
      })
    } else if (this.dialogData.workEnvironmentId) {
      // Pre-select work environment for new tasks
      this.taskForm.patchValue({
        workEnvironmentId: this.dialogData.workEnvironmentId,
      })
    }
  }

  ngOnInit(): void {
    this.loadingData = true

    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user
    })

    this.workEnvironmentService
      .getAllWorkEnvironments()
      .pipe(finalize(() => (this.loadingData = false)))
      .subscribe({
        next: (workEnvironments) => {
          // Filter work environments based on user permissions
          if (this.currentUser?.role === UserRole.ADMIN) {
            this.workEnvironments = workEnvironments
          } else if (this.currentUser?.role === UserRole.DEPARTMENT_MANAGER) {
            this.workEnvironments = workEnvironments.filter(
              (env) => env.department?.id === this.currentUser?.department?.id,
            )
          } else {
            this.workEnvironments = workEnvironments.filter((env) => env.user?.id === this.currentUser?.id)
          }

          console.log("Loaded work environments:", this.workEnvironments)
        },
        error: (error) => {
          console.error("Error loading work environments", error)
          this.snackBar.open("Failed to load work environments", "Close", { duration: 5000 })
        },
      })
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      console.log("Form is invalid:", this.taskForm.errors)
      this.markFormGroupTouched(this.taskForm)
      return
    }

    console.log("Submitting form:", this.taskForm.value)
    this.loading = true

    if (this.isEditMode && this.dialogData.task) {
      console.log("Updating existing task:", this.dialogData.task.id)
      const updateRequest: TaskUpdateRequest = {
        title: this.taskForm.value.title,
        description: this.taskForm.value.description,
        priority: this.taskForm.value.priority,
        dueDate: this.taskForm.value.dueDate ? this.taskForm.value.dueDate.toISOString() : undefined,
      }

      this.taskService
        .updateTask(this.dialogData.task.id, updateRequest)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (updatedTask) => {
            console.log("Task updated successfully:", updatedTask)
            this.snackBar.open("Task updated successfully", "Close", { duration: 3000 })
            this.dialogRef.close(true)
          },
          error: (error) => {
            console.error("Error updating task", error)
            this.snackBar.open("Failed to update task", "Close", { duration: 5000 })
          },
        })
    } else {
      console.log("Creating new task")
      const createRequest: TaskRequest = {
        title: this.taskForm.value.title,
        description: this.taskForm.value.description,
        priority: this.taskForm.value.priority,
        dueDate: this.taskForm.value.dueDate ? this.taskForm.value.dueDate.toISOString() : undefined,
        workEnvironmentId: this.taskForm.value.workEnvironmentId,
      }

      this.taskService
        .createTask(createRequest)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (createdTask) => {
            console.log("Task created successfully:", createdTask)
            this.snackBar.open("Task created successfully", "Close", { duration: 3000 })
            this.dialogRef.close(true)
          },
          error: (error) => {
            console.error("Error creating task", error)
            this.snackBar.open("Failed to create task", "Close", { duration: 5000 })
          },
        })
    }
  }

  onCancel(): void {
    this.dialogRef.close()
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key)
      control?.markAsTouched()

      if (control && typeof control === "object" && "controls" in control) {
        this.markFormGroupTouched(control as FormGroup)
      }
    })
  }
}
