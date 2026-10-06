package com.insurance.feedback.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class FeedbackDto {
    private UUID id;
    private UUID customerId;
    private String customerName;
    private int rating;
    private String comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
