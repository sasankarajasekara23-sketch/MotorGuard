package com.insurance.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateCustomerRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    private String email;

    @NotBlank(message = "National ID is required")
    private String nationalId;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{7,10}$", message = "Phone number must be 7-10 digits, numbers only")
    private String phone;

    @NotBlank(message = "Address is required")
    private String address;
}
