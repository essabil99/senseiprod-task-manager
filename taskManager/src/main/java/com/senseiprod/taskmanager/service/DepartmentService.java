package com.senseiprod.taskmanager.service;

import com.senseiprod.taskmanager.DTOs.DepartmentDto;
import com.senseiprod.taskmanager.DTOs.PaginationDto;

import java.util.List;

public interface DepartmentService {
    DepartmentDto.Response createDepartment(DepartmentDto.Request request);
    DepartmentDto.Response getDepartmentById(Long id);
    DepartmentDto.Response updateDepartment(Long id, DepartmentDto.Request request);
    void deleteDepartment(Long id);
    List<DepartmentDto.Response> getAllDepartments();
    PaginationDto<DepartmentDto.Response> getDepartmentsPaginated(int page, int size, String sortBy, String sortDir);
}
