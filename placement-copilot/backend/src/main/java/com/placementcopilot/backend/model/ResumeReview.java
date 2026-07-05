package com.placementcopilot.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.List;

@Document(collection = "resumeReviews")
public class ResumeReview {
    @Id
    private String id;
    private String userId;
    private String resumeText;
    private Feedback feedback;
    private Instant createdAt;

    public ResumeReview() {}

    public ResumeReview(String userId, String resumeText, Feedback feedback, Instant createdAt) {
        this.userId = userId;
        this.resumeText = resumeText;
        this.feedback = feedback;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getResumeText() { return resumeText; }
    public void setResumeText(String resumeText) { this.resumeText = resumeText; }

    public Feedback getFeedback() { return feedback; }
    public void setFeedback(Feedback feedback) { this.feedback = feedback; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static class Feedback {
        private String what;
        private String how;
        private String impact;
        private int score;
        private List<String> suggestions;

        public Feedback() {}

        public Feedback(String what, String how, String impact, int score, List<String> suggestions) {
            this.what = what;
            this.how = how;
            this.impact = impact;
            this.score = score;
            this.suggestions = suggestions;
        }

        public String getWhat() { return what; }
        public void setWhat(String what) { this.what = what; }

        public String getHow() { return how; }
        public void setHow(String how) { this.how = how; }

        public String getImpact() { return impact; }
        public void setImpact(String impact) { this.impact = impact; }

        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }

        public List<String> getSuggestions() { return suggestions; }
        public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }
    }
}
