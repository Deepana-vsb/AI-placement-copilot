package com.placementcopilot.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "plannerFolders")
public class PlannerFolder {
    @Id
    private String id;
    private String userId;
    private String name;          // e.g. "Module 1 - DSA Basics"
    private String description;   // optional description
    private String icon;          // emoji icon e.g. "📁"
    private String color;         // color code e.g. "#6366f1"
    private int sortOrder;        // for manual ordering
    private Instant createdAt;
    private Instant updatedAt;

    public PlannerFolder() {}

    public PlannerFolder(String userId, String name, String description,
                         String icon, String color, int sortOrder,
                         Instant createdAt, Instant updatedAt) {
        this.userId = userId;
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.color = color;
        this.sortOrder = sortOrder;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
