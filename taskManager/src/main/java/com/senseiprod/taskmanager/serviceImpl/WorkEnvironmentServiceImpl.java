package com.senseiprod.taskmanager.serviceImpl;



import com.senseiprod.taskmanager.DTOs.DepartmentDto;
import com.senseiprod.taskmanager.DTOs.PaginationDto;
import com.senseiprod.taskmanager.DTOs.UserDto;
import com.senseiprod.taskmanager.DTOs.WorkEnvironmentDto;
import com.senseiprod.taskmanager.entity.Department;
import com.senseiprod.taskmanager.entity.User;
import com.senseiprod.taskmanager.entity.WorkEnvironment;
import com.senseiprod.taskmanager.DTOs.ApiException;
import com.senseiprod.taskmanager.DTOs.ResourceNotFoundException;
import com.senseiprod.taskmanager.repository.DepartmentRepository;
import com.senseiprod.taskmanager.repository.UserRepository;
import com.senseiprod.taskmanager.repository.WorkEnvironmentRepository;
import com.senseiprod.taskmanager.service.WorkEnvironmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkEnvironmentServiceImpl implements WorkEnvironmentService {

    private final WorkEnvironmentRepository workEnvironmentRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    @Transactional
    public WorkEnvironmentDto.Response createWorkEnvironment(WorkEnvironmentDto.Request request) {
        // Check if work environment for this user and department already exists
        if (workEnvironmentRepository.existsByUserIdAndDepartmentId(request.getUserId(), request.getDepartmentId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Work environment for this user and department already exists");
        }

        // Get user
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        // Get department
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

        // Create work environment
        WorkEnvironment workEnvironment = WorkEnvironment.builder()
                .name(request.getName())
                .description(request.getDescription())
                .user(user)
                .department(department)
                .build();

        WorkEnvironment savedWorkEnvironment = workEnvironmentRepository.save(workEnvironment);
        return mapToResponse(savedWorkEnvironment);
    }

    @Override
    @Transactional(readOnly = true)
    public WorkEnvironmentDto.Response getWorkEnvironmentById(Long id) {
        WorkEnvironment workEnvironment = workEnvironmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work Environment", "id", id));
        return mapToResponse(workEnvironment);
    }

    @Override
    @Transactional
    public WorkEnvironmentDto.Response updateWorkEnvironment(Long id, WorkEnvironmentDto.UpdateRequest request) {
        WorkEnvironment workEnvironment = workEnvironmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work Environment", "id", id));

        if (request.getName() != null) {
            workEnvironment.setName(request.getName());
        }

        if (request.getDescription() != null) {
            workEnvironment.setDescription(request.getDescription());
        }

        WorkEnvironment updatedWorkEnvironment = workEnvironmentRepository.save(workEnvironment);
        return mapToResponse(updatedWorkEnvironment);
    }

    @Override
    @Transactional
    public void deleteWorkEnvironment(Long id) {
        WorkEnvironment workEnvironment = workEnvironmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work Environment", "id", id));
        workEnvironmentRepository.delete(workEnvironment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkEnvironmentDto.Response> getAllWorkEnvironments() {
        List<WorkEnvironment> workEnvironments = workEnvironmentRepository.findAll();
        return workEnvironments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkEnvironmentDto.Response> getWorkEnvironmentsByUserId(Long userId) {
        List<WorkEnvironment> workEnvironments = workEnvironmentRepository.findByUserId(userId);
        return workEnvironments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkEnvironmentDto.Response> getWorkEnvironmentsByDepartmentId(Long departmentId) {
        List<WorkEnvironment> workEnvironments = workEnvironmentRepository.findByDepartmentId(departmentId);
        return workEnvironments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public WorkEnvironmentDto.Response getWorkEnvironmentByUserAndDepartment(Long userId, Long departmentId) {
        WorkEnvironment workEnvironment = workEnvironmentRepository.findByUserIdAndDepartmentId(userId, departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Work Environment", "user_id and department_id",
                        userId + " and " + departmentId));
        return mapToResponse(workEnvironment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationDto<WorkEnvironmentDto.Response> getWorkEnvironmentsPaginated(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<WorkEnvironment> workEnvironmentsPage = workEnvironmentRepository.findAll(pageable);

        List<WorkEnvironmentDto.Response> content = workEnvironmentsPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PaginationDto.<WorkEnvironmentDto.Response>builder()
                .content(content)
                .pageNumber(workEnvironmentsPage.getNumber())
                .pageSize(workEnvironmentsPage.getSize())
                .totalElements(workEnvironmentsPage.getTotalElements())
                .totalPages(workEnvironmentsPage.getTotalPages())
                .first(workEnvironmentsPage.isFirst())
                .last(workEnvironmentsPage.isLast())
                .build();
    }

    private WorkEnvironmentDto.Response mapToResponse(WorkEnvironment workEnvironment) {
        return WorkEnvironmentDto.Response.builder()
                .id(workEnvironment.getId())
                .name(workEnvironment.getName())
                .description(workEnvironment.getDescription())
                .user(UserDto.Summary.builder()
                        .id(workEnvironment.getUser().getId())
                        .email(workEnvironment.getUser().getEmail())
                        .fullName(workEnvironment.getUser().getFullName())
                        .role(workEnvironment.getUser().getRole())
                        .build())
                .department(DepartmentDto.Summary.builder()
                        .id(workEnvironment.getDepartment().getId())
                        .name(workEnvironment.getDepartment().getName())
                        .build())
                .createdAt(workEnvironment.getCreatedAt())
                .updatedAt(workEnvironment.getUpdatedAt())
                .todoTasksCount((int) workEnvironment.getTodoTasksCount())
                .pendingTasksCount((int) workEnvironment.getPendingTasksCount())
                .doneTasksCount((int) workEnvironment.getDoneTasksCount())
                .build();
    }
}
