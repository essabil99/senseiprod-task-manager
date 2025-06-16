package com.senseiprod.taskmanager.service;

import com.senseiprod.taskmanager.DTOs.PaginationDto;
import com.senseiprod.taskmanager.DTOs.TaskDto;
import com.senseiprod.taskmanager.DTOs.TaskFilterDto;
import com.senseiprod.taskmanager.entity.Task;

import java.util.List;

public interface TaskService {
    TaskDto.Response createTask(TaskDto.Request request);
    TaskDto.Response getTaskById(Long id);
    TaskDto.Response updateTask(Long id, TaskDto.UpdateRequest request);
    TaskDto.Response updateTaskStatus(Long id, Task.TaskStatus status);
    void deleteTask(Long id);
    List<TaskDto.Response> getAllTasks();
    List<TaskDto.Response> getTasksByWorkEnvironmentId(Long workEnvironmentId);
    List<TaskDto.Response> getTasksByWorkEnvironmentIdAndStatus(Long workEnvironmentId, Task.TaskStatus status);
    PaginationDto<TaskDto.Response> getTasksPaginated(TaskFilterDto filterDto);
    TaskDto.Response progressTask(Long id);
}
