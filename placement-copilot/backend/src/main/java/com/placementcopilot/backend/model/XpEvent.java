package com.placementcopilot.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "xpEvents")
public class XpEvent {
    @Id
    private String id;
    private String userId;
    private int amount;
    private String reason;
    private Instant createdAt;

    public XpEvent() {}

    public XpEvent(String userId, int amount, String reason, Instant createdAt) {
        this.userId = userId;
        this.amount = amount;
        this.reason = reason;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public int getAmount() { return amount; }
    public void setAmount(int amount) { this.amount = amount; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
