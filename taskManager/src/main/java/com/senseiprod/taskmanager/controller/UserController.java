package com.senseiprod.taskmanager.controller;



import com.senseiprod.taskmanager.DTOs.PaginationDto;
import com.senseiprod.taskmanager.DTOs.UserDto;
import com.senseiprod.taskmanager.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://192.168.11.123:4200", allowCredentials = "true")
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserDto.Response> createUser(@Valid @RequestBody UserDto.Request request) {
        return new ResponseEntity<>(userService.createUser(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto.Response> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto.Response> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserDto.UpdateRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<UserDto.Response>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<UserDto.Response>> getUsersByDepartmentId(@PathVariable Long departmentId) {
        return ResponseEntity.ok(userService.getUsersByDepartmentId(departmentId));
    }

    @GetMapping("/paginated")
    public ResponseEntity<PaginationDto<UserDto.Response>> getUsersPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "lastName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return ResponseEntity.ok(userService.getUsersPaginated(page, size, sortBy, sortDir));
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<UserDto.Response> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody UserDto.PasswordChangeRequest request) {
        return ResponseEntity.ok(userService.changePassword(id, request));
    }
}
