package com.insurance.customer.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class CustomerDto {
    private UUID id;
    private UUID userId;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String nationalId;
}
