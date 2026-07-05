package com.placementcopilot.backend.repository;

import com.placementcopilot.backend.model.ResumeReview;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ResumeReviewRepository extends MongoRepository<ResumeReview, String> {
    List<ResumeReview> findByUserId(String userId);
    long countByUserId(String userId);
    List<ResumeReview> findByUserIdOrderByCreatedAtDesc(String userId);
}
