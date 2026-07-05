package com.placementcopilot.backend.repository;

import com.placementcopilot.backend.model.PlannerTask;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PlannerTaskRepository extends MongoRepository<PlannerTask, String> {
    List<PlannerTask> findByUserIdOrderByCreatedAtDesc(String userId);
    List<PlannerTask> findByUserIdAndFolderIdOrderByCreatedAtDesc(String userId, String folderId);
    List<PlannerTask> findByUserIdAndFolderIdIsNullOrderByCreatedAtDesc(String userId);
    long countByUserIdAndStatus(String userId, String status);
    long countByUserIdAndFolderId(String userId, String folderId);
    long countByUserIdAndFolderIdAndStatus(String userId, String folderId, String status);
    void deleteByFolderId(String folderId);
}
