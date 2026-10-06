package com.insurance.common;

import com.insurance.customer.Customer;
import com.insurance.customer.CustomerRepository;
import com.insurance.policy.Policy;
import com.insurance.policy.PolicyRepository;
import com.insurance.policy.PolicyStatus;
import com.insurance.policy.PolicyType;
import com.insurance.user.Role;
import com.insurance.user.User;
import com.insurance.user.UserRepository;
import com.insurance.vehicle.Vehicle;
import com.insurance.vehicle.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final PolicyRepository policyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("✅ Database already seeded — skipping.");
            return;
        }

        log.info("🌱 Seeding database with default users...");
        String password = passwordEncoder.encode("password123");

        // CUSTOMER
        User customerUser = createUser("Alice Johnson", "customer@motorguard.com", password, Role.CUSTOMER);
        Customer customer = new Customer();
        customer.setUser(customerUser);
        customer.setPhone("0123456789");
        customer.setAddress("12, Jalan Bukit Bintang, Kuala Lumpur");
        customer.setNationalId("900101-14-5678");
        customerRepository.save(customer);

        // Sample vehicle + policy for the customer
        Vehicle vehicle = new Vehicle();
        vehicle.setRegistrationNo("WXY-1234");
        vehicle.setMake("Toyota");
        vehicle.setModel("Camry");
        vehicle.setYear(2021);
        vehicle.setChassisNo("JT2BF22K1W0123456");
        vehicle.setCustomer(customer);
        vehicleRepository.save(vehicle);

        Policy policy = new Policy();
        policy.setVehicle(vehicle);
        policy.setPolicyType(PolicyType.COMPREHENSIVE);
        policy.setStartDate(LocalDate.now());
        policy.setEndDate(LocalDate.now().plusYears(1));
        policy.setPremiumAmount(new BigDecimal("1200.00"));
        policy.setStatus(PolicyStatus.ACTIVE);
        policyRepository.save(policy);

        // Staff roles
        createUser("Bob Smith", "supervisor@motorguard.com", password, Role.SUPERVISOR);
        createUser("Carol Lee", "claims@motorguard.com", password, Role.CLAIMS_OFFICER);
        createUser("David Wong", "ops@motorguard.com", password, Role.OPERATIONS_MANAGER);
        createUser("Eve Tan", "branch@motorguard.com", password, Role.BRANCH_MANAGER);
        createUser("Frank Lim", "finance@motorguard.com", password, Role.FINANCE_EXECUTIVE);

        log.info("==========================================================");
        log.info("  MotorGuard — Default Login Credentials");
        log.info("==========================================================");
        log.info("  Role              | Email                           | Password");
        log.info("  ------------------|----------------------------------|------------");
        log.info("  CUSTOMER          | customer@motorguard.com         | password123");
        log.info("  SUPERVISOR        | supervisor@motorguard.com       | password123");
        log.info("  CLAIMS_OFFICER    | claims@motorguard.com           | password123");
        log.info("  OPERATIONS_MANAGER| ops@motorguard.com              | password123");
        log.info("  BRANCH_MANAGER    | branch@motorguard.com           | password123");
        log.info("  FINANCE_EXECUTIVE | finance@motorguard.com          | password123");
        log.info("==========================================================");
    }

    private User createUser(String name, String email, String passwordHash, Role role) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordHash);
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
}
