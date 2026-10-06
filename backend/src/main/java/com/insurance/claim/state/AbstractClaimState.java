package com.insurance.claim.state;

import com.insurance.claim.ClaimStatus;
import com.insurance.common.BusinessRuleException;

/**
 * Default behaviour: every transition is illegal and editing/deleting is
 * allowed. Concrete states override only what they actually permit.
 */
abstract class AbstractClaimState implements ClaimState {

    @Override
    public ClaimStatus review() {
        throw new BusinessRuleException(
                "Only SUBMITTED claims can move to UNDER_REVIEW. Current status: " + status());
    }

    @Override
    public ClaimStatus decide(boolean approved) {
        throw new BusinessRuleException(
                "Only claims UNDER_REVIEW can be decided (approved/rejected). Current status: " + status());
    }

    @Override
    public ClaimStatus pay() {
        throw new BusinessRuleException(
                "Only claims with status APPROVED can be paid. Current status: " + status());
    }

    @Override
    public void ensureEditable() {
        // allowed by default
    }

    @Override
    public void ensureDeletable() {
        // allowed by default
    }
}
