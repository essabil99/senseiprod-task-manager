package com.senseiprod.taskmanager.security;

import com.senseiprod.taskmanager.entity.User;
import com.senseiprod.taskmanager.entity.WorkEnvironment;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class PermissionUtils {

    public static UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) authentication.getPrincipal();
        }
        return null;
    }

    public static boolean isAdmin() {
        UserPrincipal user = getCurrentUser();
        return user != null && user.getRole() == User.Role.ADMIN;
    }

    public static boolean isDepartmentManager() {
        UserPrincipal user = getCurrentUser();
        return user != null && user.getRole() == User.Role.DEPARTMENT_MANAGER;
    }

    public static boolean isEmployee() {
        UserPrincipal user = getCurrentUser();
        return user != null && user.getRole() == User.Role.EMPLOYEE;
    }

    public static boolean canModifyWorkEnvironment(WorkEnvironment workEnvironment) {
        UserPrincipal user = getCurrentUser();
        if (user == null) return false;

        // Admin can modify any work environment
        if (user.getRole() == User.Role.ADMIN) return true;

        // Department manager can modify work environments in their department
        if (user.getRole() == User.Role.DEPARTMENT_MANAGER &&
                user.getDepartmentId().equals(workEnvironment.getDepartment().getId())) {
            return true;
        }

        // Employee can only modify their own work environment
        return user.getId().equals(workEnvironment.getUser().getId());
    }

    public static boolean canViewWorkEnvironment(WorkEnvironment workEnvironment) {
        UserPrincipal user = getCurrentUser();
        if (user == null) return false;

        // Admin can view any work environment
        if (user.getRole() == User.Role.ADMIN) return true;

        // Users can view work environments in their department
        return user.getDepartmentId().equals(workEnvironment.getDepartment().getId());
    }

    public static boolean isSameDepartment(Long departmentId) {
        UserPrincipal user = getCurrentUser();
        return user != null && user.getDepartmentId().equals(departmentId);
    }
}
