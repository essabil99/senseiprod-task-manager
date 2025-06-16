package com.senseiprod.taskmanager.controller;



import com.senseiprod.taskmanager.DTOs.PaginationDto;
import com.senseiprod.taskmanager.DTOs.WorkEnvironmentDto;
import com.senseiprod.taskmanager.service.WorkEnvironmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-environments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://192.168.11.123:4200", allowCredentials = "true")
public class WorkEnvironmentController {

    private final WorkEnvironmentService workEnvironmentService;

    @PostMapping
    public ResponseEntity<WorkEnvironmentDto.Response> createWorkEnvironment(@Valid @RequestBody WorkEnvironmentDto.Request request) {
        return new ResponseEntity<>(workEnvironmentService.createWorkEnvironment(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkEnvironmentDto.Response> getWorkEnvironmentById(@PathVariable Long id) {
        return ResponseEntity.ok(workEnvironmentService.getWorkEnvironmentById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkEnvironmentDto.Response> updateWorkEnvironment(
            @PathVariable Long id,
            @Valid @RequestBody WorkEnvironmentDto.UpdateRequest request) {
        return ResponseEntity.ok(workEnvironmentService.updateWorkEnvironment(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkEnvironment(@PathVariable Long id) {
        workEnvironmentService.deleteWorkEnvironment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<WorkEnvironmentDto.Response>> getAllWorkEnvironments() {
        return ResponseEntity.ok(workEnvironmentService.getAllWorkEnvironments());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WorkEnvironmentDto.Response>> getWorkEnvironmentsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(workEnvironmentService.getWorkEnvironmentsByUserId(userId));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<WorkEnvironmentDto.Response>> getWorkEnvironmentsByDepartmentId(@PathVariable Long departmentId) {
        return ResponseEntity.ok(workEnvironmentService.getWorkEnvironmentsByDepartmentId(departmentId));
    }

    @GetMapping("/user/{userId}/department/{departmentId}")
    public ResponseEntity<WorkEnvironmentDto.Response> getWorkEnvironmentByUserAndDepartment(
            @PathVariable Long userId,
            @PathVariable Long departmentId) {
        return ResponseEntity.ok(workEnvironmentService.getWorkEnvironmentByUserAndDepartment(userId, departmentId));
    }

    @GetMapping("/paginated")
    public ResponseEntity<PaginationDto<WorkEnvironmentDto.Response>> getWorkEnvironmentsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return ResponseEntity.ok(workEnvironmentService.getWorkEnvironmentsPaginated(page, size, sortBy, sortDir));
    }
}
