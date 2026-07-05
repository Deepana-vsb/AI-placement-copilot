package com.placementcopilot.backend.controller;

import com.placementcopilot.backend.model.PracticeSubmission;
import com.placementcopilot.backend.model.XpEvent;
import com.placementcopilot.backend.repository.PracticeSubmissionRepository;
import com.placementcopilot.backend.repository.XpEventRepository;
import com.placementcopilot.backend.service.OfflineDbService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/practice")
public class PracticeController {

    @Autowired
    private PracticeSubmissionRepository practiceSubmissionRepository;

    @Autowired
    private XpEventRepository xpEventRepository;

    @Autowired
    private OfflineDbService offlineDbService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitPractice(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        String module = body.get("module");
        String problemId = body.get("problemId");
        String userCode = body.get("userCode");
        String status = body.getOrDefault("status", "completed");

        if (module == null || problemId == null || userCode == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "module, problemId, and userCode are required"));
        }

        PracticeSubmission submission = new PracticeSubmission(userId, module, problemId, userCode, status, Instant.now());
        PracticeSubmission savedSubmission;

        try {
            offlineDbService.savePracticeSubmission(submission);
            if (!offlineDbService.isDbOffline()) {
                savedSubmission = practiceSubmissionRepository.save(submission);
            } else {
                savedSubmission = submission;
            }
        } catch (Exception e) {
            offlineDbService.setDbOffline(true);
            System.err.println("MongoDB Connection Exception in submitPractice: " + e.getMessage());
            savedSubmission = offlineDbService.savePracticeSubmission(submission);
        }

        // Add an XP event if it was passed/completed
        if ("passed".equalsIgnoreCase(status) || "completed".equalsIgnoreCase(status)) {
            // Check if user already solved it to prevent XP farming
            boolean alreadySolved = false;
            try {
                if (!offlineDbService.isDbOffline()) {
                    alreadySolved = !practiceSubmissionRepository.findByUserIdAndModuleAndProblemId(userId, module, problemId).isEmpty();
                }
            } catch (Exception e) {
                offlineDbService.setDbOffline(true);
            }
            if (!alreadySolved) {
                alreadySolved = !offlineDbService.findPracticeSubmissionsByUserIdAndModuleAndProblemId(userId, module, problemId).isEmpty();
            }

            if (!alreadySolved) {
                int xpReward = "coding".equalsIgnoreCase(module) ? 250 : 100;
                String rewardReason = "Solved " + module + " practice problem: " + problemId;
                XpEvent event = new XpEvent(userId, xpReward, rewardReason, Instant.now());
                try {
                    offlineDbService.saveXpEvent(event);
                    if (!offlineDbService.isDbOffline()) {
                        xpEventRepository.save(event);
                    }
                } catch (Exception dbEx) {
                    offlineDbService.setDbOffline(true);
                    System.err.println("MongoDB Connection Exception: " + dbEx.getMessage());
                    offlineDbService.saveXpEvent(event);
                }
            }
        }

        return ResponseEntity.ok(Map.of("success", true, "submission", savedSubmission));
    }

    @GetMapping("/submissions")
    public ResponseEntity<?> getSubmissions(
            @RequestParam(value = "module", required = false) String module,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        try {
            if (offlineDbService.isDbOffline()) {
                throw new RuntimeException("Database flagged offline");
            }
            List<PracticeSubmission> submissions = (module != null && !module.trim().isEmpty())
                    ? practiceSubmissionRepository.findByUserIdAndModule(userId, module)
                    : practiceSubmissionRepository.findByUserId(userId);
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            offlineDbService.setDbOffline(true);
            System.err.println("MongoDB Connection Exception in getSubmissions: " + e.getMessage());
            List<PracticeSubmission> submissions = (module != null && !module.trim().isEmpty())
                    ? offlineDbService.findPracticeSubmissionsByUserIdAndModule(userId, module)
                    : offlineDbService.findPracticeSubmissionsByUserId(userId);
            return ResponseEntity.ok(submissions);
        }
    }
}
