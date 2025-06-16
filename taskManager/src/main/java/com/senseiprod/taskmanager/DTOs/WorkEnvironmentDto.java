package com.senseiprod.taskmanager.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class WorkEnvironmentDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "Name is required")
        private String name;

        private String description;

        @NotNull(message = "User ID is required")
        private Long userId;

        @NotNull(message = "Department ID is required")
        private Long departmentId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String name;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private UserDto.Summary user;
        private DepartmentDto.Summary department;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private int todoTasksCount;
        private int pendingTasksCount;
        private int doneTasksCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Long id;
        private String name;
        private UserDto.Summary user;
    }
}
