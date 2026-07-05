package com.placementcopilot.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Document(collection = "onboarding")
public class Onboarding {
    @Id
    private String id;
    private String userId;
    private String targetRole;
    private List<String> targetCompanies;
    private Map<String, Integer> selfRatedSkills;
    private Instant createdAt;

    public Onboarding() {}

    public Onboarding(String userId, String targetRole, List<String> targetCompanies, Map<String, Integer> selfRatedSkills, Instant createdAt) {
        this.userId = userId;
        this.targetRole = targetRole;
        this.targetCompanies = targetCompanies;
        this.selfRatedSkills = selfRatedSkills;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public List<String> getTargetCompanies() { return targetCompanies; }
    public void setTargetCompanies(List<String> targetCompanies) { this.targetCompanies = targetCompanies; }

    public Map<String, Integer> getSelfRatedSkills() { return selfRatedSkills; }
    public void setSelfRatedSkills(Map<String, Integer> selfRatedSkills) { this.selfRatedSkills = selfRatedSkills; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
