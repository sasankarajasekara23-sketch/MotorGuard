package com.insurance.vehicle;

import com.insurance.common.BusinessRuleException;
import com.insurance.customer.Customer;
import com.insurance.customer.CustomerRepository;
import com.insurance.user.User;
import com.insurance.vehicle.dto.VehicleDto;
import com.insurance.vehicle.dto.VehicleRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VehicleServiceTest {

    @Mock private VehicleRepository vehicleRepository;
    @Mock private CustomerRepository customerRepository;

    @InjectMocks
    private VehicleService vehicleService;

    private Customer customer() {
        Customer c = new Customer();
        c.setId(UUID.randomUUID());
        User u = new User();
        u.setName("Test");
        c.setUser(u);
        return c;
    }

    private VehicleRequest request() {
        VehicleRequest req = new VehicleRequest();
        req.setRegistrationNo(" abc-123 ");
        req.setMake("Toyota");
        req.setModel("Camry");
        req.setYear(2021);
        req.setChassisNo("jt2bf22k1w0123456");
        return req;
    }

    @Test
    void createVehicle_Success_NormalisesRegistrationAndChassis() {
        when(customerRepository.findByUserEmail("test@test.com")).thenReturn(Optional.of(customer()));
        when(vehicleRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        VehicleDto res = vehicleService.createVehicle("test@test.com", request());

        assertEquals("Toyota", res.getMake());
        assertEquals("ABC-123", res.getRegistrationNo());
        assertEquals("JT2BF22K1W0123456", res.getChassisNo());
    }

    @Test
    void createVehicle_DuplicateRegistration_IsRejected() {
        when(customerRepository.findByUserEmail("test@test.com")).thenReturn(Optional.of(customer()));
        when(vehicleRepository.existsByRegistrationNo("ABC-123")).thenReturn(true);

        assertThrows(BusinessRuleException.class,
                () -> vehicleService.createVehicle("test@test.com", request()));
        verify(vehicleRepository, never()).save(any());
    }

    @Test
    void createVehicle_DuplicateChassis_IsRejected() {
        when(customerRepository.findByUserEmail("test@test.com")).thenReturn(Optional.of(customer()));
        when(vehicleRepository.existsByChassisNo("JT2BF22K1W0123456")).thenReturn(true);

        assertThrows(BusinessRuleException.class,
                () -> vehicleService.createVehicle("test@test.com", request()));
        verify(vehicleRepository, never()).save(any());
    }
}
