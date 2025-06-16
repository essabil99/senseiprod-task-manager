package com.senseiprod.taskmanager.DTOs;


import com.senseiprod.taskmanager.entity.Task;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskFilterDto {
    private Long workEnvironmentId;
    private Task.TaskStatus status;
    private Task.Priority priority;
    private LocalDateTime dueDateFrom;
    private LocalDateTime dueDateTo;
    private Boolean overdue;
    private String searchTerm;
    private String sortBy;
    private String sortDirection;
    private Integer page;
    private Integer size;
}
