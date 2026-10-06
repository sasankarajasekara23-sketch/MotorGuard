package com.insurance.policy;

import com.insurance.vehicle.Vehicle;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class PolicyServiceTest {

    @InjectMocks
    private PolicyService policyService;

    @Test
    void calculatePremium_Success() {
        Vehicle v = new Vehicle();
        assertEquals(new BigDecimal("500.00"), policyService.calculatePremium(PolicyType.BASIC, v));
        assertEquals(new BigDecimal("1200.00"), policyService.calculatePremium(PolicyType.COMPREHENSIVE, v));
        assertEquals(new BigDecimal("300.00"), policyService.calculatePremium(PolicyType.THIRD_PARTY, v));
    }
}
