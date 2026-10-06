package com.insurance.claim.state;

import com.insurance.claim.ClaimStatus;
import java.util.EnumMap;
import java.util.Map;

/**
 * Maps a persisted {@link ClaimStatus} to its stateless {@link ClaimState}
 * object. The states hold no data, so one shared instance each is enough.
 */
public final class ClaimStateFactory {

    private static final Map<ClaimStatus, ClaimState> STATES = new EnumMap<>(ClaimStatus.class);

    static {
        STATES.put(ClaimStatus.SUBMITTED, new SubmittedClaimState());
        STATES.put(ClaimStatus.UNDER_REVIEW, new UnderReviewClaimState());
        STATES.put(ClaimStatus.APPROVED, new ApprovedClaimState());
        STATES.put(ClaimStatus.REJECTED, new RejectedClaimState());
        STATES.put(ClaimStatus.PAID, new PaidClaimState());
    }

    private ClaimStateFactory() {
    }

    public static ClaimState of(ClaimStatus status) {
        return STATES.get(status);
    }
}
