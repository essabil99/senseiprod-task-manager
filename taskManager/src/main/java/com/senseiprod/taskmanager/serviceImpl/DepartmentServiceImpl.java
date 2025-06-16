package com.senseiprod.taskmanager.serviceImpl;




import com.senseiprod.taskmanager.DTOs.DepartmentDto;
import com.senseiprod.taskmanager.DTOs.PaginationDto;
import com.senseiprod.taskmanager.entity.Department;
import com.senseiprod.taskmanager.DTOs.ResourceNotFoundException;
import com.senseiprod.taskmanager.repository.DepartmentRepository;
import com.senseiprod.taskmanager.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.senseiprod.taskmanager.DTOs.ApiException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Override
    @Transactional
    public DepartmentDto.Response createDepartment(DepartmentDto.Request request) {
        // Check if department with same name already exists
        if (departmentRepository.existsByName(request.getName())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Department with this name already exists");
        }

        Department department = Department.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        Department savedDepartment = departmentRepository.save(department);
        return mapToResponse(savedDepartment);
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentDto.Response getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        return mapToResponse(department);
    }

    @Override
    @Transactional
    public DepartmentDto.Response updateDepartment(Long id, DepartmentDto.Request request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        // Check if another department with the same name exists
        if (!department.getName().equals(request.getName()) &&
                departmentRepository.existsByName(request.getName())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Department with this name already exists");
        }

        department.setName(request.getName());
        department.setDescription(request.getDescription());

        Department updatedDepartment = departmentRepository.save(department);
        return mapToResponse(updatedDepartment);
    }

    @Override
    @Transactional
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        departmentRepository.delete(department);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentDto.Response> getAllDepartments() {
        List<Department> departments = departmentRepository.findAll();
        return departments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationDto<DepartmentDto.Response> getDepartmentsPaginated(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Department> departmentsPage = departmentRepository.findAll(pageable);

        List<DepartmentDto.Response> content = departmentsPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PaginationDto.<DepartmentDto.Response>builder()
                .content(content)
                .pageNumber(departmentsPage.getNumber())
                .pageSize(departmentsPage.getSize())
                .totalElements(departmentsPage.getTotalElements())
                .totalPages(departmentsPage.getTotalPages())
                .first(departmentsPage.isFirst())
                .last(departmentsPage.isLast())
                .build();
    }

    private DepartmentDto.Response mapToResponse(Department department) {
        return DepartmentDto.Response.builder()
                .id(department.getId())
                .name(department.getName())
                .description(department.getDescription())
                .createdAt(department.getCreatedAt())
                .updatedAt(department.getUpdatedAt())
                .userCount(department.getUsers() != null ? department.getUsers().size() : 0)
                .workEnvironmentCount(department.getWorkEnvironments() != null ? department.getWorkEnvironments().size() : 0)
                .build();
    }
}
