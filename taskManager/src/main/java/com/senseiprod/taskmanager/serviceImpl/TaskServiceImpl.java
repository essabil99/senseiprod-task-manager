package com.senseiprod.taskmanager.serviceImpl;



import com.senseiprod.taskmanager.DTOs.*;
import com.senseiprod.taskmanager.entity.Task;
import com.senseiprod.taskmanager.entity.WorkEnvironment;
import com.senseiprod.taskmanager.repository.TaskRepository;
import com.senseiprod.taskmanager.repository.WorkEnvironmentRepository;
import com.senseiprod.taskmanager.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final WorkEnvironmentRepository workEnvironmentRepository;

    @Override
    @Transactional
    public TaskDto.Response createTask(TaskDto.Request request) {
        // Get work environment
        WorkEnvironment workEnvironment = workEnvironmentRepository.findById(request.getWorkEnvironmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Work Environment", "id", request.getWorkEnvironmentId()));

        // Create task (always starts in TODO status)
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(Task.TaskStatus.TODO) // Always start as TODO
                .priority(request.getPriority() != null ? request.getPriority() : Task.Priority.MEDIUM)
                .dueDate(request.getDueDate())
                .workEnvironment(workEnvironment)
                .build();

        Task savedTask = taskRepository.save(task);
        return mapToResponse(savedTask);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskDto.Response getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));
        return mapToResponse(task);
    }

    @Override
    @Transactional
    public TaskDto.Response updateTask(Long id, TaskDto.UpdateRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }

        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }

        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }

        Task updatedTask = taskRepository.save(task);
        return mapToResponse(updatedTask);
    }

    @Override
    @Transactional
    public TaskDto.Response updateTaskStatus(Long id, Task.TaskStatus status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        // Validate status transition
        if (status == Task.TaskStatus.TODO && task.getStatus() != Task.TaskStatus.TODO) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot move task back to TODO status");
        }

        if (status == Task.TaskStatus.PENDING && task.getStatus() == Task.TaskStatus.DONE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot move task from DONE to PENDING status");
        }

        task.setStatus(status);
        Task updatedTask = taskRepository.save(task);
        return mapToResponse(updatedTask);
    }

    @Override
    @Transactional
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));
        taskRepository.delete(task);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDto.Response> getAllTasks() {
        List<Task> tasks = taskRepository.findAll();
        return tasks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDto.Response> getTasksByWorkEnvironmentId(Long workEnvironmentId) {
        List<Task> tasks = taskRepository.findByWorkEnvironmentId(workEnvironmentId);
        return tasks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDto.Response> getTasksByWorkEnvironmentIdAndStatus(Long workEnvironmentId, Task.TaskStatus status) {
        List<Task> tasks = taskRepository.findByWorkEnvironmentIdAndStatus(workEnvironmentId, status);
        return tasks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationDto<TaskDto.Response> getTasksPaginated(TaskFilterDto filterDto) {
        // Create specification based on filter criteria
        List<Task> filteredTasks = new ArrayList<>();

        // Get all tasks for the work environment
        List<Task> allTasks = filterDto.getWorkEnvironmentId() != null ?
                taskRepository.findByWorkEnvironmentId(filterDto.getWorkEnvironmentId()) :
                taskRepository.findAll();

        // Apply filters
        for (Task task : allTasks) {
            boolean include = true;

            // Filter by status
            if (filterDto.getStatus() != null && task.getStatus() != filterDto.getStatus()) {
                include = false;
            }

            // Filter by priority
            if (filterDto.getPriority() != null && task.getPriority() != filterDto.getPriority()) {
                include = false;
            }

            // Filter by due date range
            if (filterDto.getDueDateFrom() != null &&
                    (task.getDueDate() == null || task.getDueDate().isBefore(filterDto.getDueDateFrom()))) {
                include = false;
            }

            if (filterDto.getDueDateTo() != null &&
                    (task.getDueDate() == null || task.getDueDate().isAfter(filterDto.getDueDateTo()))) {
                include = false;
            }

            // Filter by overdue
            if (filterDto.getOverdue() != null) {
                boolean isOverdue = task.isOverdue();
                if (filterDto.getOverdue() != isOverdue) {
                    include = false;
                }
            }

            // Filter by search term
            if (filterDto.getSearchTerm() != null && !filterDto.getSearchTerm().isEmpty()) {
                String searchTerm = filterDto.getSearchTerm().toLowerCase();
                boolean matchesSearch =
                        (task.getTitle() != null && task.getTitle().toLowerCase().contains(searchTerm)) ||
                                (task.getDescription() != null && task.getDescription().toLowerCase().contains(searchTerm));

                if (!matchesSearch) {
                    include = false;
                }
            }

            if (include) {
                filteredTasks.add(task);
            }
        }

        // Sort the filtered tasks
        String sortBy = filterDto.getSortBy() != null ? filterDto.getSortBy() : "createdAt";
        String sortDir = filterDto.getSortDirection() != null ? filterDto.getSortDirection() : "desc";

        filteredTasks.sort((t1, t2) -> {
            int result = 0;

            switch (sortBy) {
                case "title":
                    result = t1.getTitle().compareTo(t2.getTitle());
                    break;
                case "dueDate":
                    if (t1.getDueDate() == null && t2.getDueDate() == null) {
                        result = 0;
                    } else if (t1.getDueDate() == null) {
                        result = 1;
                    } else if (t2.getDueDate() == null) {
                        result = -1;
                    } else {
                        result = t1.getDueDate().compareTo(t2.getDueDate());
                    }
                    break;
                case "priority":
                    result = t1.getPriority().compareTo(t2.getPriority());
                    break;
                case "status":
                    result = t1.getStatus().compareTo(t2.getStatus());
                    break;
                default:
                    result = t1.getCreatedAt().compareTo(t2.getCreatedAt());
            }

            return sortDir.equalsIgnoreCase("asc") ? result : -result;
        });

        // Paginate the results
        int page = filterDto.getPage() != null ? filterDto.getPage() : 0;
        int size = filterDto.getSize() != null ? filterDto.getSize() : 10;

        int start = page * size;
        int end = Math.min(start + size, filteredTasks.size());

        List<Task> pagedTasks = start < filteredTasks.size() ?
                filteredTasks.subList(start, end) : new ArrayList<>();

        // Map to DTOs
        List<TaskDto.Response> content = pagedTasks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        // Create pagination response
        return PaginationDto.<TaskDto.Response>builder()
                .content(content)
                .pageNumber(page)
                .pageSize(size)
                .totalElements((long) filteredTasks.size())
                .totalPages((int) Math.ceil((double) filteredTasks.size() / size))
                .first(page == 0)
                .last((page + 1) * size >= filteredTasks.size())
                .build();
    }

    @Override
    @Transactional
    public TaskDto.Response progressTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        if (!task.canProgressToNext()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Task is already in the final state");
        }

        task.setStatus(task.getNextStatus());
        Task updatedTask = taskRepository.save(task);
        return mapToResponse(updatedTask);
    }

    private TaskDto.Response mapToResponse(Task task) {
        return TaskDto.Response.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .workEnvironment(WorkEnvironmentDto.Summary.builder()
                        .id(task.getWorkEnvironment().getId())
                        .name(task.getWorkEnvironment().getName())
                        .user(UserDto.Summary.builder()
                                .id(task.getWorkEnvironment().getUser().getId())
                                .email(task.getWorkEnvironment().getUser().getEmail())
                                .fullName(task.getWorkEnvironment().getUser().getFullName())
                                .role(task.getWorkEnvironment().getUser().getRole())
                                .build())
                        .build())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .isOverdue(task.isOverdue())
                .build();
    }
}
