package com.insurance.vehicle.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VehicleRequest {

    @NotBlank(message = "Registration number is required")
    private String registrationNo;

    @NotBlank(message = "Make is required")
    private String make;

    @NotBlank(message = "Model is required")
    private String model;

    @NotNull(message = "Year is required")
    @Min(value = 1900, message = "Year must be 1900 or later")
    @Max(value = 2050, message = "Year must be 2050 or earlier")
    private Integer year;

    @NotBlank(message = "Chassis number is required")
    private String chassisNo;
}
