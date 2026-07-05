package com.placementcopilot.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placementcopilot.backend.model.InterviewSession;
import com.placementcopilot.backend.model.Onboarding;
import com.placementcopilot.backend.model.XpEvent;
import com.placementcopilot.backend.repository.InterviewSessionRepository;
import com.placementcopilot.backend.repository.OnboardingRepository;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/interview")
public class InterviewController {

    @Autowired
    private InterviewSessionRepository interviewSessionRepository;

    @Autowired
    private OnboardingRepository onboardingRepository;

    @Autowired
    private XpEventRepository xpEventRepository;

    @Autowired
    private GroqService groqService;

    @Autowired
    private OfflineDbService offlineDbService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping
    public ResponseEntity<?> manageInterview(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        String sessionId = body.get("sessionId");
        String message = body.get("message");

        try {
            InterviewSession session = null;
            String targetRole = "Software Engineer";

            if (sessionId != null && !sessionId.trim().isEmpty()) {
                try {
                    Optional<InterviewSession> sessionOpt = interviewSessionRepository.findById(sessionId);
                    if (sessionOpt.isPresent() && sessionOpt.get().getUserId().equals(userId)) {
                        session = sessionOpt.get();
                        targetRole = session.getTargetRole();
                    }
                } catch (Exception dbEx) {
                    System.err.println("MongoDB Connection Exception in manageInterview findById: " + dbEx.getMessage());
                }

                if (session == null) {
                    session = offlineDbService.findInterviewSessionById(sessionId).orElse(null);
                    if (session != null && session.getUserId().equals(userId)) {
                        targetRole = session.getTargetRole();
                    } else {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Interview session not found"));
                    }
                }
            } else {
                try {
                    Optional<Onboarding> onboardingOpt = onboardingRepository.findByUserId(userId);
                    if (onboardingOpt.isPresent()) {
                        targetRole = onboardingOpt.get().getTargetRole();
                    }
                } catch (Exception dbEx) {
                    System.err.println("MongoDB Connection Exception in manageOnboarding: " + dbEx.getMessage());
                }

                Onboarding onboarding = offlineDbService.findOnboardingByUserId(userId).orElse(null);
                if (onboarding != null) {
                    targetRole = onboarding.getTargetRole();
                }

                // Create a new session
                session = new InterviewSession(userId, targetRole, new ArrayList<>(), Instant.now());
                try {
                    offlineDbService.saveInterviewSession(session);
                    session = interviewSessionRepository.save(session);
                } catch (Exception dbEx) {
                    System.err.println("MongoDB Connection Exception in saveInterviewSession: " + dbEx.getMessage());
                    session = offlineDbService.saveInterviewSession(session);
                }
            }

            String interviewer = body.get("interviewer");
            String interviewerRule = "Act strictly in character as a professional and friendly tech interviewer.";
            if ("Marcus".equals(interviewer)) {
                interviewerRule = "Act strictly in character as Marcus, a Senior Tech Lead. Your style is strict, direct, challenging, and focuses deeply on systems scaling, optimization efficiency, and data structures.";
            } else if ("Rachel".equals(interviewer)) {
                interviewerRule = "Act strictly in character as Rachel, a Senior Data Scientist. Your style is supportive, analytical, structured, and focuses on database schemas, SQL operations, query performance, and analytics models.";
            } else if ("Chloe".equals(interviewer)) {
                interviewerRule = "Act strictly in character as Chloe, a Talent Partner. Your style is friendly, warm, conversational, and focuses on behavioral questions, team alignment, conflict resolution, and career ambitions.";
            }

            String systemPromptContent = "You are conducting a mock technical interview for the role of: " + targetRole + ".\n" +
                    "Your goals are to assess the candidate's core technical understanding, problem-solving methodologies, and communication.\n\n" +
                    "Rules of the conversation:\n" +
                    "1. " + interviewerRule + "\n" +
                    "2. Ask exactly ONE clear, concise question at a time.\n" +
                    "3. Do NOT output long summaries, explanations, or code blocks.\n" +
                    "4. Listen to the candidate's answer and ask a logical follow-up question or gently correct them if they are off track, then ask the next question.\n" +
                    "5. Keep your responses under 3-4 sentences.\n\n" +
                    "Start the interview by introducing yourself (using your name and role) and asking an appropriate initial question tailored to the target role.";

            List<Map<String, String>> groqMessages = new ArrayList<>();
            groqMessages.add(Map.of("role", "system", "content", systemPromptContent));

            for (InterviewSession.Message m : session.getMessages()) {
                groqMessages.add(Map.of("role", m.getRole(), "content", m.getContent()));
            }

            if (message != null && !message.trim().isEmpty()) {
                groqMessages.add(Map.of("role", "user", "content", message));
                session.getMessages().add(new InterviewSession.Message("user", message, Instant.now()));
            }

            String botResponse = groqService.callChatCompletion(groqMessages, 0.7);

            session.getMessages().add(new InterviewSession.Message("assistant", botResponse, Instant.now()));
            try {
                offlineDbService.saveInterviewSession(session);
                interviewSessionRepository.save(session);
            } catch (Exception dbEx) {
                System.err.println("MongoDB Connection Exception in saveInterviewSession end: " + dbEx.getMessage());
                offlineDbService.saveInterviewSession(session);
            }

            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("sessionId", session.getId());
            res.put("targetRole", targetRole);
            res.put("messages", session.getMessages());
            res.put("nextQuestion", botResponse);

            return ResponseEntity.ok(res);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Failed to process interview message"));
        }
    }

    @PostMapping("/end")
    public ResponseEntity<?> endInterview(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        String sessionId = body.get("sessionId");
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Session ID is required"));
        }

        try {
            InterviewSession session = null;
            try {
                Optional<InterviewSession> sessionOpt = interviewSessionRepository.findById(sessionId);
                if (sessionOpt.isPresent() && sessionOpt.get().getUserId().equals(userId)) {
                    session = sessionOpt.get();
                }
            } catch (Exception dbEx) {
                System.err.println("MongoDB Connection Exception in endInterview findById: " + dbEx.getMessage());
            }

            if (session == null) {
                session = offlineDbService.findInterviewSessionById(sessionId).orElse(null);
                if (session == null || !session.getUserId().equals(userId)) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Session not found"));
                }
            }

            String transcript = session.getMessages().stream()
                    .filter(m -> "user".equals(m.getRole()) || "assistant".equals(m.getRole()))
                    .map(m -> ("user".equals(m.getRole()) ? "Candidate" : "Interviewer") + ": " + m.getContent())
                    .collect(Collectors.joining("\n\n"));

            String evaluationSystemPrompt = "You are a Senior Technical Calibration Committee Member. Your ONLY job is to evaluate and score a transcript of a mock technical interview for the target role: " + session.getTargetRole() + ".\n" +
                    "Analyze the interview conversation and output a structured performance report.\n" +
                    "You must output a single, valid JSON object matching the following structure exactly, and nothing else. Do not wrap the JSON in Markdown formatting (e.g. do not use ```json).\n\n" +
                    "JSON Schema:\n" +
                    "{\n" +
                    "  \"strengths\": [\n" +
                    "    \"Identify a clear technical strength demonstrated by the candidate\",\n" +
                    "    \"Identify a communication or conceptual strength\"\n" +
                    "  ],\n" +
                    "  \"weaknesses\": [\n" +
                    "    \"Identify a key technical area that needs improvement or where the candidate was wrong/uncertain\",\n" +
                    "    \"Identify a structural or communication improvement area\"\n" +
                    "  ],\n" +
                    "  \"skillScores\": {\n" +
                    "    \"technical\": 80, // score out of 100\n" +
                    "    \"communication\": 85, // score out of 100\n" +
                    "    \"confidence\": 75 // score out of 100\n" +
                    "  },\n" +
                    "  \"overallScore\": 80 // overall average score out of 100\n" +
                    "}\n\n" +
                    "Evaluate the following transcript:\n" +
                    "---\n" +
                    transcript + "\n" +
                    "---";

            List<Map<String, String>> messages = List.of(
                    Map.of("role", "system", "content", "You are a helpful assistant that only outputs valid JSON."),
                    Map.of("role", "user", "content", evaluationSystemPrompt)
            );

            String outputText = groqService.callChatCompletion(messages, 0.2);

            // Defensive parsing
            int startIndex = outputText.indexOf("{");
            int endIndex = outputText.lastIndexOf("}");
            if (startIndex == -1 || endIndex == -1) {
                throw new RuntimeException("Invalid JSON returned by evaluation Groq Agent: " + outputText);
            }
            String cleanJson = outputText.substring(startIndex, endIndex + 1);

            JsonNode feedbackNode = objectMapper.readTree(cleanJson);

            List<String> strengths = new ArrayList<>();
            if (feedbackNode.has("strengths") && feedbackNode.get("strengths").isArray()) {
                for (JsonNode s : feedbackNode.get("strengths")) {
                    strengths.add(s.asText());
                }
            }

            List<String> weaknesses = new ArrayList<>();
            if (feedbackNode.has("weaknesses") && feedbackNode.get("weaknesses").isArray()) {
                for (JsonNode w : feedbackNode.get("weaknesses")) {
                    weaknesses.add(w.asText());
                }
            }

            int technical = feedbackNode.get("skillScores").get("technical").asInt();
            int communication = feedbackNode.get("skillScores").get("communication").asInt();
            int confidence = feedbackNode.get("skillScores").get("confidence").asInt();
            int overallScore = feedbackNode.get("overallScore").asInt();

            Map<String, Integer> skillScores = Map.of(
                    "technical", technical,
                    "communication", communication,
                    "confidence", confidence
            );

            InterviewSession.Feedback feedback = new InterviewSession.Feedback(strengths, weaknesses, skillScores, overallScore);
            session.setFeedback(feedback);
            session.setEndedAt(Instant.now());

            try {
                offlineDbService.saveInterviewSession(session);
                interviewSessionRepository.save(session);
            } catch (Exception dbEx) {
                System.err.println("MongoDB Connection Exception in endInterview save: " + dbEx.getMessage());
                offlineDbService.saveInterviewSession(session);
            }

            // Insert 250 XP Event
            XpEvent xpEvent = new XpEvent(userId, 250, "Mock Interview Evaluation Completed", Instant.now());
            try {
                xpEventRepository.save(xpEvent);
            } catch (Exception dbEx) {
                System.err.println("MongoDB Connection Exception in saveXpEvent: " + dbEx.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "feedback", feedback
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Failed to end interview"));
        }
    }
}
