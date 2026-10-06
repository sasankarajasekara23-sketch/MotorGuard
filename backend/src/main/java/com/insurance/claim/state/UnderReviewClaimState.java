package com.insurance.claim.state;

import com.insurance.claim.ClaimStatus;

/** A claims officer is assessing the claim. */
class UnderReviewClaimState extends AbstractClaimState {

    @Override
    public ClaimStatus status() {
        return ClaimStatus.UNDER_REVIEW;
    }

    @Override
    public ClaimStatus decide(boolean approved) {
        return approved ? ClaimStatus.APPROVED : ClaimStatus.REJECTED;
    }
}
