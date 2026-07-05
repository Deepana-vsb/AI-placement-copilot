package com.placementcopilot.backend.controller;

import com.placementcopilot.backend.model.ResumeReview;
import com.placementcopilot.backend.model.InterviewSession;
import com.placementcopilot.backend.model.XpEvent;
import com.placementcopilot.backend.repository.ResumeReviewRepository;
import com.placementcopilot.backend.repository.InterviewSessionRepository;
import com.placementcopilot.backend.repository.XpEventRepository;
import com.placementcopilot.backend.service.OfflineDbService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private XpEventRepository xpEventRepository;

    @Autowired
    private ResumeReviewRepository resumeReviewRepository;

    @Autowired
    private InterviewSessionRepository interviewSessionRepository;

    @Autowired
    private OfflineDbService offlineDbService;

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        try {
            if (offlineDbService.isDbOffline()) {
                throw new RuntimeException("Database flagged offline");
            }
            // 1. Fetch XP events & calculate total XP
            List<XpEvent> xpEvents = xpEventRepository.findByUserId(userId);
            int xpTotal = xpEvents.stream().mapToInt(XpEvent::getAmount).sum();

            // 2. Calculate Streak (UTC based)
            int streak = 0;
            if (!xpEvents.isEmpty()) {
                Set<String> dateStrings = new HashSet<>();
                DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneOffset.UTC);
                for (XpEvent event : xpEvents) {
                    dateStrings.add(dtf.format(event.getCreatedAt()));
                }

                List<String> sortedDates = new ArrayList<>(dateStrings);
                Collections.sort(sortedDates, Collections.reverseOrder());

                LocalDate today = LocalDate.now(ZoneOffset.UTC);
                LocalDate yesterday = today.minusDays(1);

                String todayStr = today.toString();
                String yesterdayStr = yesterday.toString();

                boolean hasToday = sortedDates.contains(todayStr);
                boolean hasYesterday = sortedDates.contains(yesterdayStr);

                if (hasToday || hasYesterday) {
                    LocalDate currentStreakDate = hasToday ? today : yesterday;
                    while (sortedDates.contains(currentStreakDate.toString())) {
                        streak++;
                        currentStreakDate = currentStreakDate.minusDays(1);
                    }
                }
            }

            // 3. Count documents
            long resumeCount = resumeReviewRepository.countByUserId(userId);
            long interviewCount = interviewSessionRepository.countByUserId(userId);

            // 4. Retrieve latest resume and interview scores
            Integer latestResumeScore = null;
            List<ResumeReview> reviews = resumeReviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
            if (!reviews.isEmpty()) {
                latestResumeScore = reviews.get(0).getFeedback().getScore();
            }

            Integer latestInterviewScore = null;
            List<InterviewSession> interviews = interviewSessionRepository.findByUserIdAndFeedbackNotNullOrderByCreatedAtDesc(userId);
            if (!interviews.isEmpty()) {
                latestInterviewScore = interviews.get(0).getFeedback().getOverallScore();
            }

            // 5. Generate Weak Topic Alert
            Map<String, Object> weakTopicAlert = new HashMap<>();
            if (latestInterviewScore != null && latestInterviewScore < 70) {
                weakTopicAlert.put("topic", "System Design & Algorithms");
                weakTopicAlert.put("details", "Your latest technical mock session scored below 70%. Focus on optimization complexity.");
                weakTopicAlert.put("actionText", "Solve Coding Challenges");
                weakTopicAlert.put("actionUrl", "/codingpractice");
            } else if (latestResumeScore != null && latestResumeScore < 75) {
                weakTopicAlert.put("topic", "ATS Resume Keywords");
                weakTopicAlert.put("details", "Improve bullet points with measurable project metrics using What/How/Impact syntax.");
                weakTopicAlert.put("actionText", "Recalibrate Resume");
                weakTopicAlert.put("actionUrl", "/resumereview");
            } else {
                weakTopicAlert.put("topic", "Data Structures & Core SQL");
                weakTopicAlert.put("details", "Keep up the momentum! Review index normalization and tree traversal methods.");
                weakTopicAlert.put("actionText", "Practice SQL Queries");
                weakTopicAlert.put("actionUrl", "/sqlpractice");
            }

            long solvedProblems = xpEvents.stream()
                .filter(ev -> ev.getReason() != null && ev.getReason().toLowerCase().contains("solved"))
                .count();

            Map<String, Object> stats = new HashMap<>();
            stats.put("xpTotal", xpTotal);
            stats.put("streak", streak);
            stats.put("resumeCount", (int) resumeCount);
            stats.put("interviewCount", (int) interviewCount);
            stats.put("latestResumeScore", latestResumeScore);
            stats.put("latestInterviewScore", latestInterviewScore);
            stats.put("weakTopicAlert", weakTopicAlert);
            stats.put("solvedProblems", (int) solvedProblems);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            offlineDbService.setDbOffline(true);
            System.err.println("MongoDB Connection Exception in DashboardController: " + e.getMessage() + ". Using offline DB stats.");
            
            // 1. Fetch offline XP events & calculate total XP
            List<XpEvent> xpEvents = offlineDbService.findXpEventsByUserId(userId);
            int xpTotal = xpEvents.stream().mapToInt(XpEvent::getAmount).sum();

            // 2. Calculate Streak (UTC based)
            int streak = 0;
            if (!xpEvents.isEmpty()) {
                Set<String> dateStrings = new HashSet<>();
                DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneOffset.UTC);
                for (XpEvent event : xpEvents) {
                    dateStrings.add(dtf.format(event.getCreatedAt()));
                }

                List<String> sortedDates = new ArrayList<>(dateStrings);
                Collections.sort(sortedDates, Collections.reverseOrder());

                LocalDate today = LocalDate.now(ZoneOffset.UTC);
                LocalDate yesterday = today.minusDays(1);

                String todayStr = today.toString();
                String yesterdayStr = yesterday.toString();

                boolean hasToday = sortedDates.contains(todayStr);
                boolean hasYesterday = sortedDates.contains(yesterdayStr);

                if (hasToday || hasYesterday) {
                    LocalDate currentStreakDate = hasToday ? today : yesterday;
                    while (sortedDates.contains(currentStreakDate.toString())) {
                        streak++;
                        currentStreakDate = currentStreakDate.minusDays(1);
                    }
                }
            }

            // 3. Count documents
            long resumeCount = offlineDbService.countResumeReviewsByUserId(userId);
            
            List<InterviewSession> sessions = offlineDbService.findInterviewSessionsByUserId(userId);
            long interviewCount = sessions.size();

            // 4. Retrieve latest resume and interview scores
            Integer latestResumeScore = null;
            List<ResumeReview> reviews = offlineDbService.findResumeReviewsByUserId(userId);
            if (!reviews.isEmpty()) {
                latestResumeScore = reviews.get(0).getFeedback().getScore();
            }

            Integer latestInterviewScore = null;
            Optional<InterviewSession> latestScoredOpt = sessions.stream()
                .filter(s -> s.getFeedback() != null)
                .findFirst();
            if (latestScoredOpt.isPresent()) {
                latestInterviewScore = latestScoredOpt.get().getFeedback().getOverallScore();
            }

            // 5. Generate Weak Topic Alert
            Map<String, Object> weakTopicAlert = new HashMap<>();
            if (latestInterviewScore != null && latestInterviewScore < 70) {
                weakTopicAlert.put("topic", "System Design & Algorithms");
                weakTopicAlert.put("details", "Your latest technical mock session scored below 70%. Focus on optimization complexity.");
                weakTopicAlert.put("actionText", "Solve Coding Challenges");
                weakTopicAlert.put("actionUrl", "/codingpractice");
            } else if (latestResumeScore != null && latestResumeScore < 75) {
                weakTopicAlert.put("topic", "ATS Resume Keywords");
                weakTopicAlert.put("details", "Improve bullet points with measurable project metrics using What/How/Impact syntax.");
                weakTopicAlert.put("actionText", "Recalibrate Resume");
                weakTopicAlert.put("actionUrl", "/resumereview");
            } else {
                weakTopicAlert.put("topic", "Data Structures & Core SQL");
                weakTopicAlert.put("details", "Keep up the momentum! Review index normalization and tree traversal methods.");
                weakTopicAlert.put("actionText", "Practice SQL Queries");
                weakTopicAlert.put("actionUrl", "/sqlpractice");
            }

            long solvedProblems = xpEvents.stream()
                .filter(ev -> ev.getReason() != null && ev.getReason().toLowerCase().contains("solved"))
                .count();

            Map<String, Object> stats = new HashMap<>();
            stats.put("xpTotal", xpTotal);
            stats.put("streak", streak);
            stats.put("resumeCount", (int) resumeCount);
            stats.put("interviewCount", (int) interviewCount);
            stats.put("latestResumeScore", latestResumeScore);
            stats.put("latestInterviewScore", latestInterviewScore);
            stats.put("weakTopicAlert", weakTopicAlert);
            stats.put("solvedProblems", (int) solvedProblems);

            return ResponseEntity.ok(stats);
        }
    }
}
