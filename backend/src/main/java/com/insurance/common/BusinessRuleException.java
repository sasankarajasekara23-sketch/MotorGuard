package com.insurance.common;

/**
 * Thrown when a business rule is violated.
 * GlobalExceptionHandler maps this to HTTP 409 Conflict.
 */
public class BusinessRuleException extends RuntimeException {
    public BusinessRuleException(String message) {
        super(message);
    }
}
