package com.placementcopilot.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "plannerTasks")
public class PlannerTask {
    @Id
    private String id;
    private String userId;
    private String folderId;   // null = "Inbox / No Folder"
    private String title;
    private String description;
    private String category;   // e.g. "DSA", "System Design", "Resume", "Mock Interview"
    private String priority;   // "high", "medium", "low"
    private String status;     // "todo", "in_progress", "done"
    private String dueDate;    // ISO date string "YYYY-MM-DD"
    private Instant createdAt;
    private Instant updatedAt;

    public PlannerTask() {}

    public PlannerTask(String userId, String folderId, String title, String description,
                       String category, String priority, String status, String dueDate,
                       Instant createdAt, Instant updatedAt) {
        this.userId = userId;
        this.folderId = folderId;
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;
        this.status = status;
        this.dueDate = dueDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getFolderId() { return folderId; }
    public void setFolderId(String folderId) { this.folderId = folderId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
