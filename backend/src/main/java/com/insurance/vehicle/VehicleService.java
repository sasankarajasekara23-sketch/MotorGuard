package com.insurance.vehicle;

import com.insurance.common.BusinessRuleException;
import com.insurance.common.ResourceNotFoundException;
import com.insurance.customer.Customer;
import com.insurance.customer.CustomerRepository;
import com.insurance.policy.PolicyRepository;
import com.insurance.policy.PolicyStatus;
import com.insurance.vehicle.dto.VehicleDto;
import com.insurance.vehicle.dto.VehicleRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;
    private final PolicyRepository policyRepository;

    public List<VehicleDto> getVehiclesByCustomerEmail(String email) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return vehicleRepository.findByCustomerId(customer.getId()).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    public List<VehicleDto> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    public VehicleDto getVehicleById(UUID id, Authentication auth) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        verifyVehicleAccess(vehicle, auth);
        return mapToDto(vehicle);
    }

    public VehicleDto getVehicleById(UUID id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        return mapToDto(vehicle);
    }

    @Transactional
    public VehicleDto createVehicle(String email, VehicleRequest request) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        String regNo    = request.getRegistrationNo().trim().toUpperCase();
        String chassisNo = request.getChassisNo().trim().toUpperCase();

        // Duplicate registration number check
        if (vehicleRepository.existsByRegistrationNo(regNo)) {
            throw new BusinessRuleException(
                    "A vehicle with registration number '" + regNo + "' already exists.");
        }

        // Duplicate chassis number check
        if (vehicleRepository.existsByChassisNo(chassisNo)) {
            throw new BusinessRuleException(
                    "A vehicle with chassis number '" + chassisNo + "' already exists.");
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setCustomer(customer);
        vehicle.setRegistrationNo(regNo);
        vehicle.setMake(request.getMake().trim());
        vehicle.setModel(request.getModel().trim());
        vehicle.setYear(request.getYear());
        vehicle.setChassisNo(chassisNo);

        return mapToDto(vehicleRepository.save(vehicle));
    }

    @Transactional
    public VehicleDto updateVehicle(UUID id, VehicleRequest request, Authentication auth) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        verifyVehicleAccess(vehicle, auth);

        String regNo     = request.getRegistrationNo().trim().toUpperCase();
        String chassisNo = request.getChassisNo().trim().toUpperCase();

        // Duplicate registration number check — exclude this vehicle's own current value
        if (vehicleRepository.existsByRegistrationNoAndIdNot(regNo, id)) {
            throw new BusinessRuleException(
                    "A vehicle with registration number '" + regNo + "' already exists.");
        }

        // Duplicate chassis number check — exclude this vehicle's own current value
        if (vehicleRepository.existsByChassisNoAndIdNot(chassisNo, id)) {
            throw new BusinessRuleException(
                    "A vehicle with chassis number '" + chassisNo + "' already exists.");
        }

        vehicle.setRegistrationNo(regNo);
        vehicle.setMake(request.getMake().trim());
        vehicle.setModel(request.getModel().trim());
        vehicle.setYear(request.getYear());
        vehicle.setChassisNo(chassisNo);

        return mapToDto(vehicleRepository.save(vehicle));
    }

    @Transactional
    public void deleteVehicle(UUID id, Authentication auth) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        verifyVehicleAccess(vehicle, auth);

        // Policy dependency check — check whether vehicle has associated policies
        if (policyRepository.existsByVehicleId(id)) {
            throw new BusinessRuleException(
                    "Cannot delete vehicle: it has associated insurance policies. " +
                    "Vehicles with policy history cannot be deleted.");
        }

        vehicleRepository.delete(vehicle);
    }

    private void verifyVehicleAccess(Vehicle vehicle, Authentication auth) {
        if (auth == null) {
            throw new AccessDeniedException("Authentication required");
        }
        boolean isStaff = auth.getAuthorities().stream()
                .anyMatch(a -> !a.getAuthority().equals("ROLE_CUSTOMER"));
        if (!isStaff) {
            String customerEmail = vehicle.getCustomer().getUser().getEmail();
            if (!customerEmail.equalsIgnoreCase(auth.getName())) {
                throw new AccessDeniedException(
                        "You do not have permission to access or modify this vehicle");
            }
        }
    }

    private VehicleDto mapToDto(Vehicle vehicle) {
        VehicleDto dto = new VehicleDto();
        dto.setId(vehicle.getId());
        dto.setCustomerId(vehicle.getCustomer().getId());
        dto.setCustomerName(vehicle.getCustomer().getUser().getName());
        dto.setRegistrationNo(vehicle.getRegistrationNo());
        dto.setMake(vehicle.getMake());
        dto.setModel(vehicle.getModel());
        dto.setYear(vehicle.getYear());
        dto.setChassisNo(vehicle.getChassisNo());
        return dto;
    }
}
