package com.senseiprod.taskmanager.config;

import com.senseiprod.taskmanager.entity.Department;
import com.senseiprod.taskmanager.entity.Task;
import com.senseiprod.taskmanager.entity.User;
import com.senseiprod.taskmanager.entity.WorkEnvironment;
import com.senseiprod.taskmanager.repository.DepartmentRepository;
import com.senseiprod.taskmanager.repository.TaskRepository;
import com.senseiprod.taskmanager.repository.UserRepository;
import com.senseiprod.taskmanager.repository.WorkEnvironmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final WorkEnvironmentRepository workEnvironmentRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // Only initialize if no departments exist
        if (departmentRepository.count() == 0) {
            log.info("Initializing sample data...");
            initDepartments();
            initUsers();
            initWorkEnvironments();
            initTasks();
            log.info("Sample data initialization complete!");
        } else {
            log.info("Database already contains data, skipping initialization");
        }
    }

    private void initDepartments() {
        List<Department> departments = List.of(
                Department.builder().name("IT").description("Information Technology Department").build(),
                Department.builder().name("Marketing").description("Marketing and Sales Department").build(),
                Department.builder().name("HR").description("Human Resources Department").build(),
                Department.builder().name("Finance").description("Finance and Accounting Department").build()
        );
        departmentRepository.saveAll(departments);
        log.info("Created {} departments", departments.size());
    }

    private void initUsers() {
        // Get departments
        Department itDepartment = departmentRepository.findByName("IT").orElseThrow();
        Department marketingDepartment = departmentRepository.findByName("Marketing").orElseThrow();

        // Create users with encoded password
        String encodedPassword = passwordEncoder.encode("password123");

        List<User> users = List.of(
                User.builder()
                        .email("admin@company.com")
                        .password(encodedPassword)
                        .firstName("Admin")
                        .lastName("User")
                        .role(User.Role.ADMIN)
                        .department(itDepartment)
                        .isActive(true)
                        .build(),

                User.builder()
                        .email("john.doe@company.com")
                        .password(encodedPassword)
                        .firstName("John")
                        .lastName("Doe")
                        .role(User.Role.EMPLOYEE)
                        .department(itDepartment)
                        .isActive(true)
                        .build(),

                User.builder()
                        .email("jane.smith@company.com")
                        .password(encodedPassword)
                        .firstName("Jane")
                        .lastName("Smith")
                        .role(User.Role.DEPARTMENT_MANAGER)
                        .department(marketingDepartment)
                        .isActive(true)
                        .build(),

                User.builder()
                        .email("bob.wilson@company.com")
                        .password(encodedPassword)
                        .firstName("Bob")
                        .lastName("Wilson")
                        .role(User.Role.EMPLOYEE)
                        .department(marketingDepartment)
                        .isActive(true)
                        .build()
        );

        userRepository.saveAll(users);
        log.info("Created {} users", users.size());
    }

    private void initWorkEnvironments() {
        // Get users
        User johnDoe = userRepository.findByEmail("john.doe@company.com").orElseThrow();
        User janeSmith = userRepository.findByEmail("jane.smith@company.com").orElseThrow();
        User bobWilson = userRepository.findByEmail("bob.wilson@company.com").orElseThrow();

        // Get departments
        Department itDepartment = departmentRepository.findByName("IT").orElseThrow();
        Department marketingDepartment = departmentRepository.findByName("Marketing").orElseThrow();

        List<WorkEnvironment> workEnvironments = List.of(
                WorkEnvironment.builder()
                        .name("John's IT Tasks")
                        .description("Development and maintenance tasks")
                        .user(johnDoe)
                        .department(itDepartment)
                        .build(),

                WorkEnvironment.builder()
                        .name("Jane's Marketing Board")
                        .description("Marketing campaigns and strategies")
                        .user(janeSmith)
                        .department(marketingDepartment)
                        .build(),

                WorkEnvironment.builder()
                        .name("Bob's Marketing Tasks")
                        .description("Content creation and social media")
                        .user(bobWilson)
                        .department(marketingDepartment)
                        .build()
        );

        workEnvironmentRepository.saveAll(workEnvironments);
        log.info("Created {} work environments", workEnvironments.size());
    }

    private void initTasks() {
        // Get work environments
        WorkEnvironment johnWorkEnv = workEnvironmentRepository.findByUserIdAndDepartmentId(
                userRepository.findByEmail("john.doe@company.com").orElseThrow().getId(),
                departmentRepository.findByName("IT").orElseThrow().getId()
        ).orElseThrow();

        WorkEnvironment janeWorkEnv = workEnvironmentRepository.findByUserIdAndDepartmentId(
                userRepository.findByEmail("jane.smith@company.com").orElseThrow().getId(),
                departmentRepository.findByName("Marketing").orElseThrow().getId()
        ).orElseThrow();

        WorkEnvironment bobWorkEnv = workEnvironmentRepository.findByUserIdAndDepartmentId(
                userRepository.findByEmail("bob.wilson@company.com").orElseThrow().getId(),
                departmentRepository.findByName("Marketing").orElseThrow().getId()
        ).orElseThrow();

        List<Task> tasks = List.of(
                Task.builder()
                        .title("Setup CI/CD Pipeline")
                        .description("Configure automated deployment pipeline")
                        .status(Task.TaskStatus.TODO)
                        .priority(Task.Priority.HIGH)
                        .dueDate(LocalDateTime.now().plusDays(10))
                        .workEnvironment(johnWorkEnv)
                        .build(),

                Task.builder()
                        .title("Code Review")
                        .description("Review pull requests from team members")
                        .status(Task.TaskStatus.PENDING)
                        .priority(Task.Priority.MEDIUM)
                        .dueDate(LocalDateTime.now().plusDays(5))
                        .workEnvironment(johnWorkEnv)
                        .build(),

                Task.builder()
                        .title("Update Documentation")
                        .description("Update API documentation")
                        .status(Task.TaskStatus.DONE)
                        .priority(Task.Priority.LOW)
                        .dueDate(LocalDateTime.now().minusDays(2))
                        .workEnvironment(johnWorkEnv)
                        .build(),

                Task.builder()
                        .title("Q1 Campaign Planning")
                        .description("Plan marketing campaigns for Q1")
                        .status(Task.TaskStatus.TODO)
                        .priority(Task.Priority.HIGH)
                        .dueDate(LocalDateTime.now().plusDays(15))
                        .workEnvironment(janeWorkEnv)
                        .build(),

                Task.builder()
                        .title("Social Media Content")
                        .description("Create content for social media posts")
                        .status(Task.TaskStatus.PENDING)
                        .priority(Task.Priority.MEDIUM)
                        .dueDate(LocalDateTime.now().plusDays(7))
                        .workEnvironment(bobWorkEnv)
                        .build(),

                Task.builder()
                        .title("Website Redesign")
                        .description("Coordinate with design team for website updates")
                        .status(Task.TaskStatus.TODO)
                        .priority(Task.Priority.HIGH)
                        .dueDate(LocalDateTime.now().plusDays(20))
                        .workEnvironment(bobWorkEnv)
                        .build()
        );

        taskRepository.saveAll(tasks);
        log.info("Created {} tasks", tasks.size());
    }
}
