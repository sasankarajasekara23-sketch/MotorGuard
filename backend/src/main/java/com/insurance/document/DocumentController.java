package com.insurance.document;

import com.insurance.common.ApiResponse;
import com.insurance.document.dto.DocumentDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getMyDocuments(Authentication auth) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Documents retrieved",
                documentService.getDocumentsByUser(auth.getName())));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER', 'SUPERVISOR', 'CLAIMS_OFFICER')")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getAllDocuments() {
        return ResponseEntity.ok(new ApiResponse<>(true, "All documents retrieved",
                documentService.getAllDocuments()));
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'CLAIMS_OFFICER', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<DocumentDto>> uploadDocument(
            Authentication auth,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "claimId", required = false) UUID claimId,
            @RequestParam(value = "policyId", required = false) UUID policyId) {
        try {
            DocumentDto doc = documentService.uploadDocument(auth.getName(), file, claimId, policyId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, "Document uploaded", doc));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Upload failed: " + e.getMessage(), null));
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('CUSTOMER', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<DocumentDto>> updateDocument(
            @PathVariable UUID id,
            Authentication auth,
            @RequestParam(value = "fileName", required = false) String fileName,
            @RequestParam(value = "file", required = false) MultipartFile file) throws java.io.IOException {
        return ResponseEntity.ok(new ApiResponse<>(true, "Document updated",
                documentService.updateDocument(id, auth, fileName, file)));
    }

    /**
     * Download endpoint — now requires authentication and enforces ownership.
     * Customers can only download their own documents; staff may download any.
     */
    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'BRANCH_MANAGER', 'SUPERVISOR', 'CLAIMS_OFFICER')")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable UUID id, Authentication auth) {
        Document doc = documentService.getDocumentFile(id, auth);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(doc.getMimeType()))
                .body(doc.getFileData());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable UUID id, Authentication auth) {
        documentService.deleteDocument(id, auth);
        return ResponseEntity.ok(new ApiResponse<>(true, "Document deleted", null));
    }
}
