package com.senseiprod.taskmanager.repository;


import com.senseiprod.taskmanager.entity.Department;
import com.senseiprod.taskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByDepartment(Department department);
    List<User> findByDepartmentId(Long departmentId);
}
