package com.senseiprod.taskmanager.repository;


import com.senseiprod.taskmanager.entity.Department;
import com.senseiprod.taskmanager.entity.User;
import com.senseiprod.taskmanager.entity.WorkEnvironment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkEnvironmentRepository extends JpaRepository<WorkEnvironment, Long> {
    List<WorkEnvironment> findByUser(User user);
    List<WorkEnvironment> findByUserId(Long userId);
    List<WorkEnvironment> findByDepartment(Department department);
    List<WorkEnvironment> findByDepartmentId(Long departmentId);
    Optional<WorkEnvironment> findByUserIdAndDepartmentId(Long userId, Long departmentId);
    boolean existsByUserIdAndDepartmentId(Long userId, Long departmentId);
}
