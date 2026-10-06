package com.insurance.document;

import com.insurance.claim.ClaimRepository;
import com.insurance.document.dto.DocumentDto;
import com.insurance.policy.PolicyRepository;
import com.insurance.user.User;
import com.insurance.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock private DocumentRepository documentRepository;
    @Mock private UserRepository userRepository;
    @Mock private ClaimRepository claimRepository;
    @Mock private PolicyRepository policyRepository;

    @InjectMocks
    private DocumentService documentService;

    private Authentication customer(String email) {
        return new UsernamePasswordAuthenticationToken(email, null, List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")));
    }

    private Document documentOwnedBy(String email) {
        User owner = new User();
        owner.setName("Owner");
        owner.setEmail(email);

        Document doc = new Document();
        doc.setId(UUID.randomUUID());
        doc.setFileName("licence.pdf");
        doc.setMimeType("application/pdf");
        doc.setFileData(new byte[]{1, 2, 3});
        doc.setUploadedBy(owner);
        doc.setUploadedAt(LocalDateTime.now().minusDays(5));
        return doc;
    }

    private void stubFind(Document doc) {
        when(documentRepository.findById(doc.getId())).thenReturn(Optional.of(doc));
    }

    private void stubSave() {
        when(documentRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);
    }

    @Test
    void rename_keepsOriginalExtensionWhenNoneTyped() throws Exception {
        Document doc = documentOwnedBy("a@test.com");
        stubFind(doc);
        stubSave();

        DocumentDto dto = documentService.updateDocument(doc.getId(), customer("a@test.com"), "Driving licence", null);

        assertEquals("Driving licence.pdf", dto.getFileName());
    }

    @Test
    void rename_usesTheNameExactlyWhenAnExtensionIsGiven() throws Exception {
        Document doc = documentOwnedBy("a@test.com");
        stubFind(doc);
        stubSave();

        DocumentDto dto = documentService.updateDocument(doc.getId(), customer("a@test.com"), "licence-front.png", null);

        assertEquals("licence-front.png", dto.getFileName());
    }

    @Test
    void replaceFile_swapsContentAndTypeAndRefreshesUploadDate() throws Exception {
        Document doc = documentOwnedBy("a@test.com");
        LocalDateTime before = doc.getUploadedAt();
        stubFind(doc);
        stubSave();
        MockMultipartFile replacement = new MockMultipartFile("file", "scan.png", "image/png", new byte[]{9, 9});

        DocumentDto dto = documentService.updateDocument(doc.getId(), customer("a@test.com"), null, replacement);

        assertEquals("scan.png", dto.getFileName());
        assertEquals("image/png", dto.getMimeType());
        assertArrayEquals(new byte[]{9, 9}, doc.getFileData());
        assertTrue(dto.getUploadedAt().isAfter(before));
    }

    @Test
    void anotherCustomerCannotModifyTheDocument() {
        Document doc = documentOwnedBy("owner@test.com");
        stubFind(doc);

        assertThrows(AccessDeniedException.class,
                () -> documentService.updateDocument(doc.getId(), customer("intruder@test.com"), "x", null));
        verify(documentRepository, never()).save(any());
    }

    @Test
    void nothingToUpdate_isRejected() {
        Document doc = documentOwnedBy("a@test.com");
        stubFind(doc);

        assertThrows(IllegalArgumentException.class,
                () -> documentService.updateDocument(doc.getId(), customer("a@test.com"), "   ", null));
        verify(documentRepository, never()).save(any());
    }

    @Test
    void namesWithPathOrQuoteCharactersAreRejected() {
        Document doc = documentOwnedBy("a@test.com");
        stubFind(doc);

        for (String bad : new String[]{"../secret.pdf", "a\"b.pdf", "x\r\nSet-Cookie: y.pdf"}) {
            assertThrows(IllegalArgumentException.class,
                    () -> documentService.updateDocument(doc.getId(), customer("a@test.com"), bad, null));
        }
        verify(documentRepository, never()).save(any());
    }
}
