package com.senseiprod.taskmanager.controller;



import com.senseiprod.taskmanager.DTOs.PaginationDto;
import com.senseiprod.taskmanager.DTOs.TaskDto;
import com.senseiprod.taskmanager.DTOs.TaskFilterDto;
import com.senseiprod.taskmanager.entity.Task;
import com.senseiprod.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://192.168.11.123:4200", allowCredentials = "true")
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskDto.Response> createTask(@Valid @RequestBody TaskDto.Request request) {
        return new ResponseEntity<>(taskService.createTask(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDto.Response> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDto.Response> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskDto.UpdateRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TaskDto.Response> updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody TaskDto.StatusUpdateRequest request) {
        return ResponseEntity.ok(taskService.updateTaskStatus(id, request.getStatus()));
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<TaskDto.Response> progressTask(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.progressTask(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<TaskDto.Response>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/work-environment/{workEnvironmentId}")
    public ResponseEntity<List<TaskDto.Response>> getTasksByWorkEnvironmentId(@PathVariable Long workEnvironmentId) {
        return ResponseEntity.ok(taskService.getTasksByWorkEnvironmentId(workEnvironmentId));
    }

    @GetMapping("/work-environment/{workEnvironmentId}/status/{status}")
    public ResponseEntity<List<TaskDto.Response>> getTasksByWorkEnvironmentIdAndStatus(
            @PathVariable Long workEnvironmentId,
            @PathVariable Task.TaskStatus status) {
        return ResponseEntity.ok(taskService.getTasksByWorkEnvironmentIdAndStatus(workEnvironmentId, status));
    }

    @GetMapping("/filter")
    public ResponseEntity<PaginationDto<TaskDto.Response>> getTasksPaginated(
            @RequestParam(required = false) Long workEnvironmentId,
            @RequestParam(required = false) Task.TaskStatus status,
            @RequestParam(required = false) Task.Priority priority,
            @RequestParam(required = false) LocalDateTime dueDateFrom,
            @RequestParam(required = false) LocalDateTime dueDateTo,
            @RequestParam(required = false) Boolean overdue,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {

        TaskFilterDto filterDto = TaskFilterDto.builder()
                .workEnvironmentId(workEnvironmentId)
                .status(status)
                .priority(priority)
                .dueDateFrom(dueDateFrom)
                .dueDateTo(dueDateTo)
                .overdue(overdue)
                .searchTerm(searchTerm)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .page(page)
                .size(size)
                .build();

        return ResponseEntity.ok(taskService.getTasksPaginated(filterDto));
    }
}
