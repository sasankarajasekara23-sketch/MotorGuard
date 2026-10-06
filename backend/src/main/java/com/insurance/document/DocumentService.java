package com.insurance.document;

import com.insurance.claim.ClaimRepository;
import com.insurance.common.ResourceNotFoundException;
import com.insurance.document.dto.DocumentDto;
import com.insurance.policy.PolicyRepository;
import com.insurance.user.User;
import com.insurance.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    // The name ends up in a Content-Disposition header, so quotes, slashes and line breaks are rejected.
    private static final Pattern VALID_FILE_NAME = Pattern.compile("^[^\\\\/:*?\"<>|\\r\\n]+$");

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final ClaimRepository claimRepository;
    private final PolicyRepository policyRepository;

    public List<DocumentDto> getDocumentsByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return documentRepository.findByUploadedById(user.getId()).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    public List<DocumentDto> getAllDocuments() {
        return documentRepository.findAll().stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public DocumentDto uploadDocument(String email, MultipartFile file, UUID claimId, UUID policyId) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Document doc = new Document();
        doc.setFileName(file.getOriginalFilename());
        doc.setMimeType(file.getContentType());
        doc.setFileData(file.getBytes());
        doc.setUploadedBy(user);

        if (claimId != null) {
            doc.setClaim(claimRepository.findById(claimId)
                    .orElseThrow(() -> new ResourceNotFoundException("Claim not found")));
        }
        if (policyId != null) {
            doc.setPolicy(policyRepository.findById(policyId)
                    .orElseThrow(() -> new ResourceNotFoundException("Policy not found")));
        }

        return mapToDto(documentRepository.save(doc));
    }

    /**
     * Updates a document: rename it, replace its file, or both. Customers can
     * only change their own documents; staff access is limited by the controller.
     */
    @Transactional
    public DocumentDto updateDocument(UUID id, Authentication auth, String newName, MultipartFile file) throws IOException {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        if (isCustomer(auth)) {
            String ownerEmail = doc.getUploadedBy().getEmail();
            if (!ownerEmail.equalsIgnoreCase(auth.getName())) {
                throw new AccessDeniedException("You do not have permission to modify this document");
            }
        }

        boolean hasName = newName != null && !newName.isBlank();
        boolean hasFile = file != null && !file.isEmpty();
        if (!hasName && !hasFile) {
            throw new IllegalArgumentException("Provide a new file name or a replacement file.");
        }

        String name = hasName ? newName.trim() : file.getOriginalFilename();
        if (name == null || name.isBlank() || name.length() > 255 || !VALID_FILE_NAME.matcher(name).matches()) {
            throw new IllegalArgumentException(
                    "File name must be 1-255 characters and cannot contain / \\ : * ? \" < > | or line breaks.");
        }

        if (hasFile) {
            doc.setFileData(file.getBytes());
            if (file.getContentType() != null) {
                doc.setMimeType(file.getContentType());
            }
            doc.setUploadedAt(LocalDateTime.now());
        }

        // Keep the file type usable: a name typed without an extension inherits the old one.
        if (hasName && extensionOf(name).isEmpty()) {
            String inherited = hasFile ? extensionOf(file.getOriginalFilename()) : extensionOf(doc.getFileName());
            name = name + inherited;
        }
        doc.setFileName(name);

        return mapToDto(documentRepository.save(doc));
    }

    private static String extensionOf(String fileName) {
        if (fileName == null) return "";
        int dot = fileName.lastIndexOf('.');
        return dot > 0 ? fileName.substring(dot) : "";
    }

    /**
     * Returns the document entity for download, enforcing ownership/authorization.
     * Customers can only download their own documents; staff may download any.
     */
    public Document getDocumentFile(UUID id, Authentication auth) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        if (isCustomer(auth)) {
            String ownerEmail = doc.getUploadedBy().getEmail();
            if (!ownerEmail.equalsIgnoreCase(auth.getName())) {
                throw new AccessDeniedException("You do not have permission to download this document");
            }
        }
        return doc;
    }

    @Transactional
    public void deleteDocument(UUID id, Authentication auth) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        if (isCustomer(auth)) {
            String ownerEmail = doc.getUploadedBy().getEmail();
            if (!ownerEmail.equalsIgnoreCase(auth.getName())) {
                throw new AccessDeniedException("You do not have permission to delete this document");
            }
        }
        documentRepository.delete(doc);
    }

    // Returns true if the caller holds only the CUSTOMER role
    private boolean isCustomer(Authentication auth) {
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .allMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));
    }

    private DocumentDto mapToDto(Document doc) {
        DocumentDto dto = new DocumentDto();
        dto.setId(doc.getId());
        dto.setFileName(doc.getFileName());
        dto.setMimeType(doc.getMimeType());
        if (doc.getClaim() != null) dto.setClaimId(doc.getClaim().getId());
        if (doc.getPolicy() != null) dto.setPolicyId(doc.getPolicy().getId());
        dto.setUploadedBy(doc.getUploadedBy().getName());
        dto.setUploadedAt(doc.getUploadedAt());
        return dto;
    }
}
