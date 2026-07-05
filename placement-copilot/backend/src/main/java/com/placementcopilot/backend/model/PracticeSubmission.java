package com.placementcopilot.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "practiceSubmissions")
public class PracticeSubmission {
    @Id
    private String id;
    private String userId;
    private String module;      // "java", "sql", "aptitude", "coding", "communication"
    private String problemId;   // e.g. "Longest Common Subsequence", "Question 1", etc.
    private String userCode;    // source code or selected answer
    private String status;      // "passed", "failed", "completed"
    private Instant submittedAt;

    public PracticeSubmission() {}

    public PracticeSubmission(String userId, String module, String problemId, String userCode, String status, Instant submittedAt) {
        this.userId = userId;
        this.module = module;
        this.problemId = problemId;
        this.userCode = userCode;
        this.status = status;
        this.submittedAt = submittedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getModule() { return module; }
    public void setModule(String module) { this.module = module; }

    public String getProblemId() { return problemId; }
    public void setProblemId(String problemId) { this.problemId = problemId; }

    public String getUserCode() { return userCode; }
    public void setUserCode(String userCode) { this.userCode = userCode; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
}
