package com.insurance.feedback;

import com.insurance.common.ResourceNotFoundException;
import com.insurance.customer.Customer;
import com.insurance.customer.CustomerRepository;
import com.insurance.feedback.dto.FeedbackDto;
import com.insurance.feedback.dto.FeedbackRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final CustomerRepository customerRepository;

    public List<FeedbackDto> getFeedbackByUser(String email) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return feedbackRepository.findByCustomerId(customer.getId()).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    public List<FeedbackDto> getAllFeedback() {
        return feedbackRepository.findAll().stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    public FeedbackDto getFeedbackById(UUID id, Authentication auth) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));
        verifyFeedbackAccess(feedback, auth);
        return mapToDto(feedback);
    }

    @Transactional
    public FeedbackDto submitFeedback(String email, FeedbackRequest request) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Feedback feedback = new Feedback();
        feedback.setCustomer(customer);
        feedback.setRating(request.getRating());
        feedback.setComments(request.getComments());

        return mapToDto(feedbackRepository.save(feedback));
    }

    @Transactional
    public FeedbackDto updateFeedback(UUID id, String callerEmail, FeedbackRequest request) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));

        // IDOR fix: only the owner customer may update their own feedback
        String ownerEmail = feedback.getCustomer().getUser().getEmail();
        if (!ownerEmail.equalsIgnoreCase(callerEmail)) {
            throw new AccessDeniedException("You do not have permission to update this feedback");
        }

        feedback.setRating(request.getRating());
        feedback.setComments(request.getComments());
        feedback.setUpdatedAt(LocalDateTime.now());
        return mapToDto(feedbackRepository.save(feedback));
    }

    @Transactional
    public void deleteFeedback(UUID id, String callerEmail) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));

        // IDOR fix: only the owner customer may delete their own feedback
        String ownerEmail = feedback.getCustomer().getUser().getEmail();
        if (!ownerEmail.equalsIgnoreCase(callerEmail)) {
            throw new AccessDeniedException("You do not have permission to delete this feedback");
        }

        feedbackRepository.delete(feedback);
    }

    public Map<String, Object> getFeedbackSummary() {
        List<Feedback> all = feedbackRepository.findAll();
        double avg = all.stream().mapToInt(Feedback::getRating).average().orElse(0.0);

        Map<Integer, Long> counts = all.stream()
                .collect(Collectors.groupingBy(Feedback::getRating, Collectors.counting()));

        Map<String, Object> summary = new HashMap<>();
        summary.put("averageRating", avg);
        summary.put("ratingDistribution", counts);
        summary.put("totalFeedback", all.size());

        return summary;
    }

    private void verifyFeedbackAccess(Feedback feedback, Authentication auth) {
        if (auth == null) {
            throw new AccessDeniedException("Authentication required");
        }
        boolean isStaff = auth.getAuthorities().stream()
                .anyMatch(a -> !a.getAuthority().equals("ROLE_CUSTOMER"));
        if (!isStaff) {
            String ownerEmail = feedback.getCustomer().getUser().getEmail();
            if (!ownerEmail.equalsIgnoreCase(auth.getName())) {
                throw new AccessDeniedException("You do not have permission to access this feedback");
            }
        }
    }

    private FeedbackDto mapToDto(Feedback feedback) {
        FeedbackDto dto = new FeedbackDto();
        dto.setId(feedback.getId());
        dto.setCustomerId(feedback.getCustomer().getId());
        dto.setCustomerName(feedback.getCustomer().getUser().getName());
        dto.setRating(feedback.getRating());
        dto.setComments(feedback.getComments());
        dto.setCreatedAt(feedback.getCreatedAt());
        dto.setUpdatedAt(feedback.getUpdatedAt());
        return dto;
    }
}
