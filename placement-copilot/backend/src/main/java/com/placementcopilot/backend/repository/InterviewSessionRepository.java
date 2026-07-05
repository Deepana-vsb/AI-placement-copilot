package com.placementcopilot.backend.repository;

import com.placementcopilot.backend.model.InterviewSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface InterviewSessionRepository extends MongoRepository<InterviewSession, String> {
    List<InterviewSession> findByUserId(String userId);
    long countByUserId(String userId);
    List<InterviewSession> findByUserIdAndFeedbackNotNullOrderByCreatedAtDesc(String userId);
}
