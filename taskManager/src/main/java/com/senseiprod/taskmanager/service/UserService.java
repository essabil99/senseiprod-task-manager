package com.senseiprod.taskmanager.service;

import com.senseiprod.taskmanager.DTOs.PaginationDto;
import com.senseiprod.taskmanager.DTOs.UserDto;

import java.util.List;

public interface UserService {
    UserDto.Response createUser(UserDto.Request request);
    UserDto.Response getUserById(Long id);
    UserDto.Response updateUser(Long id, UserDto.UpdateRequest request);
    void deleteUser(Long id);
    List<UserDto.Response> getAllUsers();
    List<UserDto.Response> getUsersByDepartmentId(Long departmentId);
    PaginationDto<UserDto.Response> getUsersPaginated(int page, int size, String sortBy, String sortDir);
    UserDto.Response changePassword(Long id, UserDto.PasswordChangeRequest request);
}
