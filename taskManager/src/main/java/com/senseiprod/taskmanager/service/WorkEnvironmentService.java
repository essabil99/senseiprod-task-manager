package com.senseiprod.taskmanager.service;

import com.senseiprod.taskmanager.DTOs.PaginationDto;
import com.senseiprod.taskmanager.DTOs.WorkEnvironmentDto;

import java.util.List;

public interface WorkEnvironmentService {
    WorkEnvironmentDto.Response createWorkEnvironment(WorkEnvironmentDto.Request request);
    WorkEnvironmentDto.Response getWorkEnvironmentById(Long id);
    WorkEnvironmentDto.Response updateWorkEnvironment(Long id, WorkEnvironmentDto.UpdateRequest request);
    void deleteWorkEnvironment(Long id);
    List<WorkEnvironmentDto.Response> getAllWorkEnvironments();
    List<WorkEnvironmentDto.Response> getWorkEnvironmentsByUserId(Long userId);
    List<WorkEnvironmentDto.Response> getWorkEnvironmentsByDepartmentId(Long departmentId);
    WorkEnvironmentDto.Response getWorkEnvironmentByUserAndDepartment(Long userId, Long departmentId);
    PaginationDto<WorkEnvironmentDto.Response> getWorkEnvironmentsPaginated(int page, int size, String sortBy, String sortDir);
}
