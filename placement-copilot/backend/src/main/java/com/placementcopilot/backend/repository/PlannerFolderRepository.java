package com.placementcopilot.backend.repository;

import com.placementcopilot.backend.model.PlannerFolder;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PlannerFolderRepository extends MongoRepository<PlannerFolder, String> {
    List<PlannerFolder> findByUserIdOrderBySortOrderAscCreatedAtAsc(String userId);
    long countByUserId(String userId);
}
