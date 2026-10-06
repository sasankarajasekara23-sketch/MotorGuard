package com.insurance.claim.state;

import com.insurance.claim.ClaimStatus;

/** Final state: the claim was rejected, no further transitions. */
class RejectedClaimState extends AbstractClaimState {

    @Override
    public ClaimStatus status() {
        return ClaimStatus.REJECTED;
    }
}
