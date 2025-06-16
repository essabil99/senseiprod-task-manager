package com.senseiprod.taskmanager.DTOs;

import com.senseiprod.taskmanager.entity.Task;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class TaskDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "Title is required")
        private String title;

        private String description;

        private Task.Priority priority;

        private LocalDateTime dueDate;

        @NotNull(message = "Work environment ID is required")
        private Long workEnvironmentId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String title;
        private String description;
        private Task.Priority priority;
        private LocalDateTime dueDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusUpdateRequest {
        @NotNull(message = "Status is required")
        private Task.TaskStatus status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String title;
        private String description;
        private Task.TaskStatus status;
        private Task.Priority priority;
        private LocalDateTime dueDate;
        private WorkEnvironmentDto.Summary workEnvironment;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private boolean isOverdue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Long id;
        private String title;
        private Task.TaskStatus status;
        private Task.Priority priority;
        private LocalDateTime dueDate;
        private boolean isOverdue;
    }
}
