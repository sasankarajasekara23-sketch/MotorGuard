package com.insurance.claim.state;

import com.insurance.claim.ClaimStatus;
import com.insurance.common.BusinessRuleException;

/**
 * Final state: money has been paid out, so a payment record points at the
 * claim. It can no longer be edited or withdrawn.
 */
class PaidClaimState extends AbstractClaimState {

    @Override
    public ClaimStatus status() {
        return ClaimStatus.PAID;
    }

    @Override
    public void ensureEditable() {
        throw new BusinessRuleException("Cannot edit a claim that has already been paid.");
    }

    @Override
    public void ensureDeletable() {
        throw new BusinessRuleException("Cannot delete a claim that has already been paid.");
    }
}
