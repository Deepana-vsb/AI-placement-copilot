package com.placementcopilot.backend.repository;

import com.placementcopilot.backend.model.PracticeSubmission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PracticeSubmissionRepository extends MongoRepository<PracticeSubmission, String> {
    List<PracticeSubmission> findByUserId(String userId);
    List<PracticeSubmission> findByUserIdAndModule(String userId, String module);
    List<PracticeSubmission> findByUserIdAndModuleAndProblemId(String userId, String module, String problemId);
}
