package com.insurance.claim.state;

import com.insurance.claim.ClaimStatus;
import com.insurance.common.BusinessRuleException;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ClaimStateTest {

    private ClaimState state(ClaimStatus status) {
        return ClaimStateFactory.of(status);
    }

    @Test
    void factoryReturnsAStateForEveryStatus() {
        for (ClaimStatus status : ClaimStatus.values()) {
            assertNotNull(state(status), "missing state for " + status);
            assertEquals(status, state(status).status());
        }
    }

    @Test
    void happyPath_submittedToPaid() {
        ClaimStatus s = ClaimStatus.SUBMITTED;
        s = state(s).review();
        assertEquals(ClaimStatus.UNDER_REVIEW, s);
        s = state(s).decide(true);
        assertEquals(ClaimStatus.APPROVED, s);
        s = state(s).pay();
        assertEquals(ClaimStatus.PAID, s);
    }

    @Test
    void underReviewClaimCanBeRejected() {
        assertEquals(ClaimStatus.REJECTED, state(ClaimStatus.UNDER_REVIEW).decide(false));
    }

    @Test
    void onlySubmittedClaimsCanBeReviewed() {
        for (ClaimStatus s : new ClaimStatus[]{ClaimStatus.UNDER_REVIEW, ClaimStatus.APPROVED, ClaimStatus.REJECTED, ClaimStatus.PAID}) {
            BusinessRuleException ex = assertThrows(BusinessRuleException.class, () -> state(s).review());
            assertTrue(ex.getMessage().contains("Current status: " + s));
        }
    }

    @Test
    void onlyUnderReviewClaimsCanBeDecided() {
        for (ClaimStatus s : new ClaimStatus[]{ClaimStatus.SUBMITTED, ClaimStatus.APPROVED, ClaimStatus.REJECTED, ClaimStatus.PAID}) {
            assertThrows(BusinessRuleException.class, () -> state(s).decide(true));
        }
    }

    @Test
    void onlyApprovedClaimsCanBePaid() {
        for (ClaimStatus s : new ClaimStatus[]{ClaimStatus.SUBMITTED, ClaimStatus.UNDER_REVIEW, ClaimStatus.REJECTED, ClaimStatus.PAID}) {
            assertThrows(BusinessRuleException.class, () -> state(s).pay());
        }
    }

    @Test
    void paidClaimsCannotBeEditedOrDeleted() {
        assertThrows(BusinessRuleException.class, () -> state(ClaimStatus.PAID).ensureEditable());
        assertThrows(BusinessRuleException.class, () -> state(ClaimStatus.PAID).ensureDeletable());
    }

    @Test
    void unpaidClaimsCanBeEditedAndDeleted() {
        for (ClaimStatus s : new ClaimStatus[]{ClaimStatus.SUBMITTED, ClaimStatus.UNDER_REVIEW, ClaimStatus.APPROVED, ClaimStatus.REJECTED}) {
            assertDoesNotThrow(() -> state(s).ensureEditable());
            assertDoesNotThrow(() -> state(s).ensureDeletable());
        }
    }
}
