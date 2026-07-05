package com.placementcopilot.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placementcopilot.backend.model.ResumeReview;
import com.placementcopilot.backend.model.XpEvent;
import com.placementcopilot.backend.repository.ResumeReviewRepository;
import com.placementcopilot.backend.repository.XpEventRepository;
import com.placementcopilot.backend.service.GroqService;
import com.placementcopilot.backend.service.OfflineDbService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    @Autowired
    private ResumeReviewRepository resumeReviewRepository;

    @Autowired
    private XpEventRepository xpEventRepository;

    @Autowired
    private GroqService groqService;

    @Autowired
    private OfflineDbService offlineDbService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping
    public ResponseEntity<?> analyzeResume(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        String resumeText = body.get("resumeText");
        if (resumeText == null || resumeText.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Resume text is required"));
        }

        try {
            String systemPrompt = "You are a senior technical recruiter reviewing resumes for entry-level software roles.\n" +
                    "Your task is to analyze the provided resume text and generate structured feedback to improve it.\n" +
                    "Focus particularly on rewriting weak resume bullets into high-impact \"What/How/Impact\" format.\n\n" +
                    "For your feedback, you MUST output a single, valid JSON object matching the following structure exactly, and nothing else. Do not wrap the JSON in Markdown formatting (e.g. do not use ```json).\n\n" +
                    "JSON Schema:\n" +
                    "{\n" +
                    "  \"what\": \"Detailed description of the primary focus area that needs work in their project descriptions or experience bullets.\",\n" +
                    "  \"how\": \"Actionable advice on how to rewrite their bullets (specifying technologies, architectures, or frameworks).\",\n" +
                    "  \"impact\": \"Actionable advice on how to quantify and specify the measurable results (e.g. load times, user engagement, optimization ratios).\",\n" +
                    "  \"score\": 75, // Overall numerical score out of 100 based on standard industry criteria\n" +
                    "  \"suggestions\": [\n" +
                    "    \"First concrete suggestion\",\n" +
                    "    \"Second concrete suggestion\",\n" +
                    "    \"Third concrete suggestion\"\n" +
                    "  ]\n" +
                    "}\n\n" +
                    "Few-Shot Examples of bullet rewrites to guide your analysis:\n" +
                    "Example 1:\n" +
                    "- Weak Bullet: \"Helped build a website using React.\"\n" +
                    "- Strong Rewrite: \"Designed and implemented a responsive web dashboard utilizing React.js, using Tailwind CSS and React Context API for global state, resulting in a 25% faster onboarding flow.\"\n" +
                    "- What: Designing/implementing responsive dashboards.\n" +
                    "- How: React.js, Tailwind CSS, React Context.\n" +
                    "- Impact: 25% faster onboarding.\n\n" +
                    "Example 2:\n" +
                    "- Weak Bullet: \"Wrote SQL queries for customer database.\"\n" +
                    "- Strong Rewrite: \"Optimized complex relational database queries by index restructuring and join analysis, reducing average search latency by 40%.\"\n" +
                    "- What: Query optimization.\n" +
                    "- How: Relational database queries, index restructuring, join analysis.\n" +
                    "- Impact: 40% latency reduction.\n\n" +
                    "Provide constructive, professional feedback for the following resume:\n" +
                    "---\n" +
                    resumeText + "\n" +
                    "---";

            List<Map<String, String>> messages = List.of(
                    Map.of("role", "system", "content", "You are a helpful assistant that only outputs valid JSON."),
                    Map.of("role", "user", "content", systemPrompt)
            );

            String outputText = groqService.callChatCompletion(messages, 0.2);

            // Defensive parsing
            int startIndex = outputText.indexOf("{");
            int endIndex = outputText.lastIndexOf("}");
            if (startIndex == -1 || endIndex == -1) {
                throw new RuntimeException("Invalid JSON returned by Groq: " + outputText);
            }
            String cleanJson = outputText.substring(startIndex, endIndex + 1);

            JsonNode feedbackNode = objectMapper.readTree(cleanJson);

            // Extract fields
            String what = feedbackNode.get("what").asText();
            String how = feedbackNode.get("how").asText();
            String impact = feedbackNode.get("impact").asText();
            int score = feedbackNode.get("score").asInt();

            List<String> suggestions = new ArrayList<>();
            if (feedbackNode.has("suggestions") && feedbackNode.get("suggestions").isArray()) {
                for (JsonNode sug : feedbackNode.get("suggestions")) {
                    suggestions.add(sug.asText());
                }
            }

            ResumeReview.Feedback feedback = new ResumeReview.Feedback(what, how, impact, score, suggestions);
            ResumeReview review = new ResumeReview(userId, resumeText, feedback, Instant.now());
            
            try {
                if (!offlineDbService.isDbOffline()) {
                    review = resumeReviewRepository.save(review);
                } else {
                    review.setId(UUID.randomUUID().toString());
                }
            } catch (Exception dbEx) {
                offlineDbService.setDbOffline(true);
                System.err.println("MongoDB Connection Exception in ResumeController save: " + dbEx.getMessage());
                review.setId(UUID.randomUUID().toString());
            }

            // Always sync to local JSON
            offlineDbService.saveResumeReview(review);

            // Insert 150 XP Event
            XpEvent xpEvent = new XpEvent(userId, 150, "Resume Review Completed", Instant.now());
            try {
                if (!offlineDbService.isDbOffline()) {
                    xpEventRepository.save(xpEvent);
                }
            } catch (Exception dbEx) {
                offlineDbService.setDbOffline(true);
                System.err.println("MongoDB Connection Exception in ResumeController saveXp: " + dbEx.getMessage());
            }

            // Always sync to local JSON
            offlineDbService.saveXpEvent(xpEvent);

            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("reviewId", review.getId());
            res.put("feedback", feedback);

            return ResponseEntity.ok(res);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Failed to process resume review"));
        }
    }
}
