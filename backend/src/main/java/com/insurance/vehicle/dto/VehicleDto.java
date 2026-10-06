package com.insurance.vehicle.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class VehicleDto {
    private UUID id;
    private UUID customerId;
    private String customerName;
    private String registrationNo;
    private String make;
    private String model;
    private int year;
    private String chassisNo;
}
