package com.insurance.feedback;

import com.insurance.common.ApiResponse;
import com.insurance.feedback.dto.FeedbackDto;
import com.insurance.feedback.dto.FeedbackRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<FeedbackDto>>> getMyFeedback(Authentication auth) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Feedback retrieved",
                feedbackService.getFeedbackByUser(auth.getName())));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public ResponseEntity<ApiResponse<List<FeedbackDto>>> getAllFeedback() {
        return ResponseEntity.ok(new ApiResponse<>(true, "All feedback retrieved",
                feedbackService.getAllFeedback()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'SUPERVISOR')")
    public ResponseEntity<ApiResponse<FeedbackDto>> getFeedbackById(
            @PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Feedback retrieved",
                feedbackService.getFeedbackById(id, auth)));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Summary retrieved",
                feedbackService.getFeedbackSummary()));
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<FeedbackDto>> submitFeedback(
            Authentication auth, @Valid @RequestBody FeedbackRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Feedback submitted",
                        feedbackService.submitFeedback(auth.getName(), request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<FeedbackDto>> updateFeedback(
            @PathVariable UUID id, Authentication auth, @Valid @RequestBody FeedbackRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Feedback updated",
                feedbackService.updateFeedback(id, auth.getName(), request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Void>> deleteFeedback(
            @PathVariable UUID id, Authentication auth) {
        feedbackService.deleteFeedback(id, auth.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Feedback deleted", null));
    }
}
