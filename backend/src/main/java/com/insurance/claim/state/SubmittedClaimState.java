package com.insurance.claim.state;

import com.insurance.claim.ClaimStatus;

/** A newly filed claim: waiting for staff to pick it up. */
class SubmittedClaimState extends AbstractClaimState {

    @Override
    public ClaimStatus status() {
        return ClaimStatus.SUBMITTED;
    }

    @Override
    public ClaimStatus review() {
        return ClaimStatus.UNDER_REVIEW;
    }
}
