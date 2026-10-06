package com.insurance.claim.state;

import com.insurance.claim.ClaimStatus;

/** The claim was approved and is waiting to be paid out. */
class ApprovedClaimState extends AbstractClaimState {

    @Override
    public ClaimStatus status() {
        return ClaimStatus.APPROVED;
    }

    @Override
    public ClaimStatus pay() {
        return ClaimStatus.PAID;
    }
}
