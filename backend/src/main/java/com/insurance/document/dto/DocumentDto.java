package com.insurance.document.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class DocumentDto {
    private UUID id;
    private String fileName;
    private String mimeType;
    private UUID claimId;
    private UUID policyId;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
}
