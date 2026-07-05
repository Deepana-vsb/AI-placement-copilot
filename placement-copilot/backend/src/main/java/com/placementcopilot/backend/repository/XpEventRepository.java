package com.placementcopilot.backend.repository;

import com.placementcopilot.backend.model.XpEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface XpEventRepository extends MongoRepository<XpEvent, String> {
    List<XpEvent> findByUserId(String userId);
}
