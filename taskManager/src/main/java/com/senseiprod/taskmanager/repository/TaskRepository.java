package com.senseiprod.taskmanager.repository;

import com.senseiprod.taskmanager.entity.Task;
import com.senseiprod.taskmanager.entity.WorkEnvironment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByWorkEnvironment(WorkEnvironment workEnvironment);
    List<Task> findByWorkEnvironmentId(Long workEnvironmentId);
    List<Task> findByWorkEnvironmentIdAndStatus(Long workEnvironmentId, Task.TaskStatus status);
    List<Task> findByDueDateBefore(LocalDateTime date);
    List<Task> findByWorkEnvironmentIdAndDueDateBefore(Long workEnvironmentId, LocalDateTime date);
    long countByWorkEnvironmentIdAndStatus(Long workEnvironmentId, Task.TaskStatus status);
}
