package com.insurance.claim.state;

import com.insurance.claim.ClaimStatus;

/**
 * State pattern: one implementation per claim status. Each state decides which
 * actions are legal and which status they lead to, so the lifecycle rules live
 * in one place instead of scattered if-checks in the services.
 *
 * SUBMITTED -> UNDER_REVIEW -> APPROVED -> PAID
 *                           -> REJECTED
 *
 * Transition methods return the next status, or throw BusinessRuleException
 * when the action is not allowed from the current state.
 */
public interface ClaimState {

    ClaimStatus status();

    /** Staff starts reviewing the claim. */
    ClaimStatus review();

    /** Staff approves or rejects the claim. */
    ClaimStatus decide(boolean approved);

    /** The approved claim is paid out. */
    ClaimStatus pay();

    /** Throws if the customer may no longer edit this claim. */
    void ensureEditable();

    /** Throws if the customer may no longer withdraw this claim. */
    void ensureDeletable();
}
