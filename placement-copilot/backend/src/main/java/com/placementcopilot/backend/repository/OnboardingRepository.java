package com.placementcopilot.backend.repository;

import com.placementcopilot.backend.model.Onboarding;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface OnboardingRepository extends MongoRepository<Onboarding, String> {
    Optional<Onboarding> findByUserId(String userId);
}
