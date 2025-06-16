package com.senseiprod.taskmanager.serviceImpl;


import com.senseiprod.taskmanager.DTOs.AuthDto;
import com.senseiprod.taskmanager.DTOs.DepartmentDto;
import com.senseiprod.taskmanager.DTOs.UserDto;
import com.senseiprod.taskmanager.entity.Department;
import com.senseiprod.taskmanager.entity.User;
import com.senseiprod.taskmanager.DTOs.ApiException;
import com.senseiprod.taskmanager.DTOs.ResourceNotFoundException;
import com.senseiprod.taskmanager.repository.DepartmentRepository;
import com.senseiprod.taskmanager.repository.UserRepository;
import com.senseiprod.taskmanager.security.JwtUtils;
import com.senseiprod.taskmanager.security.UserPrincipal;
import com.senseiprod.taskmanager.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    @Transactional
    public AuthDto.LoginResponse login(AuthDto.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        UserDto.Response userResponse = UserDto.Response.builder()
                .id(userPrincipal.getId())
                .email(userPrincipal.getEmail())
                .firstName(userPrincipal.getFirstName())
                .lastName(userPrincipal.getLastName())
                .fullName(userPrincipal.getFullName())
                .role(userPrincipal.getRole())
                .isActive(userPrincipal.getIsActive())
                .department(DepartmentDto.Summary.builder()
                        .id(userPrincipal.getDepartmentId())
                        .build())
                .build();

        return AuthDto.LoginResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }

    @Override
    @Transactional
    public UserDto.Response register(AuthDto.RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email is already in use!");
        }

        // Get department
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

        // Create new user
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .department(department)
                .role(User.Role.EMPLOYEE) // Default role
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        return UserDto.Response.builder()
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole())
                .isActive(savedUser.getIsActive())
                .department(DepartmentDto.Summary.builder()
                        .id(savedUser.getDepartment().getId())
                        .name(savedUser.getDepartment().getName())
                        .build())
                .createdAt(savedUser.getCreatedAt())
                .updatedAt(savedUser.getUpdatedAt())
                .workEnvironmentCount(0)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto.Response getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));

        return UserDto.Response.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .department(DepartmentDto.Summary.builder()
                        .id(user.getDepartment().getId())
                        .name(user.getDepartment().getName())
                        .build())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .workEnvironmentCount(user.getWorkEnvironments() != null ? user.getWorkEnvironments().size() : 0)
                .build();
    }
}
