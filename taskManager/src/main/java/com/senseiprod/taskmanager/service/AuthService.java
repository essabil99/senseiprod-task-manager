package com.senseiprod.taskmanager.service;



import com.senseiprod.taskmanager.DTOs.AuthDto;
import com.senseiprod.taskmanager.DTOs.UserDto;

public interface AuthService {
    AuthDto.LoginResponse login(AuthDto.LoginRequest request);
    UserDto.Response register(AuthDto.RegisterRequest request);
    UserDto.Response getCurrentUser();
}
