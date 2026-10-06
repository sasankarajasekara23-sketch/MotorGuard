package com.insurance.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Returned only from PUT /api/customers/me. Email doubles as the JWT
 * subject, so a self-service email change must reissue a token in the same
 * response — otherwise the caller's existing token stops resolving to their
 * (now-renamed) account on the very next request.
 */
@Data
@AllArgsConstructor
public class ProfileUpdateResponse {
    private CustomerDto customer;
    private String token;
}
