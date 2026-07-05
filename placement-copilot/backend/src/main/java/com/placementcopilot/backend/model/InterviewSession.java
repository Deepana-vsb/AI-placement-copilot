package com.placementcopilot.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Document(collection = "interviewSessions")
public class InterviewSession {
    @Id
    private String id;
    private String userId;
    private String targetRole;
    private List<Message> messages;
    private Feedback feedback;
    private Instant createdAt;
    private Instant endedAt;

    public InterviewSession() {}

    public InterviewSession(String userId, String targetRole, List<Message> messages, Instant createdAt) {
        this.userId = userId;
        this.targetRole = targetRole;
        this.messages = messages;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public List<Message> getMessages() { return messages; }
    public void setMessages(List<Message> messages) { this.messages = messages; }

    public Feedback getFeedback() { return feedback; }
    public void setFeedback(Feedback feedback) { this.feedback = feedback; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getEndedAt() { return endedAt; }
    public void setEndedAt(Instant endedAt) { this.endedAt = endedAt; }

    public static class Message {
        private String role;
        private String content;
        private Instant createdAt;

        public Message() {}

        public Message(String role, String content, Instant createdAt) {
            this.role = role;
            this.content = content;
            this.createdAt = createdAt;
        }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }

    public static class Feedback {
        private List<String> strengths;
        private List<String> weaknesses;
        private Map<String, Integer> skillScores;
        private int overallScore;

        public Feedback() {}

        public Feedback(List<String> strengths, List<String> weaknesses, Map<String, Integer> skillScores, int overallScore) {
            this.strengths = strengths;
            this.weaknesses = weaknesses;
            this.skillScores = skillScores;
            this.overallScore = overallScore;
        }

        public List<String> getStrengths() { return strengths; }
        public void setStrengths(List<String> strengths) { this.strengths = strengths; }

        public List<String> getWeaknesses() { return weaknesses; }
        public void setWeaknesses(List<String> weaknesses) { this.weaknesses = weaknesses; }

        public Map<String, Integer> getSkillScores() { return skillScores; }
        public void setSkillScores(Map<String, Integer> skillScores) { this.skillScores = skillScores; }

        public int getOverallScore() { return overallScore; }
        public void setOverallScore(int overallScore) { this.overallScore = overallScore; }
    }
}
