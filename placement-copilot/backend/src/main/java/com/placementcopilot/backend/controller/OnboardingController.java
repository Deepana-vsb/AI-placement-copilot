package com.placementcopilot.backend.controller;

import com.placementcopilot.backend.model.Onboarding;
import com.placementcopilot.backend.repository.OnboardingRepository;
import com.placementcopilot.backend.service.OfflineDbService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/onboarding")
public class OnboardingController {

    @Autowired
    private OnboardingRepository onboardingRepository;

    @Autowired
    private OfflineDbService offlineDbService;

    @SuppressWarnings("unchecked")
    @PostMapping
    public ResponseEntity<?> saveOnboarding(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        String targetRole = (String) body.get("targetRole");
        List<String> targetCompanies = (List<String>) body.get("targetCompanies");
        Map<String, Integer> selfRatedSkills = (Map<String, Integer>) body.get("selfRatedSkills");

        if (targetRole == null || targetCompanies == null || selfRatedSkills == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "All fields are required"));
        }

        // Upsert logic with offline fallback
        Onboarding onboarding = null;
        try {
            Optional<Onboarding> existingOnboarding = onboardingRepository.findByUserId(userId);
            if (existingOnboarding.isPresent()) {
                onboarding = existingOnboarding.get();
                onboarding.setTargetRole(targetRole);
                onboarding.setTargetCompanies(targetCompanies);
                onboarding.setSelfRatedSkills(selfRatedSkills);
                onboarding.setCreatedAt(Instant.now());
            }
        } catch (Exception dbEx) {
            System.err.println("MongoDB Connection Exception in saveOnboarding findByUserId: " + dbEx.getMessage());
        }

        if (onboarding == null) {
            onboarding = offlineDbService.findOnboardingByUserId(userId).orElse(null);
            if (onboarding != null) {
                onboarding.setTargetRole(targetRole);
                onboarding.setTargetCompanies(targetCompanies);
                onboarding.setSelfRatedSkills(selfRatedSkills);
                onboarding.setCreatedAt(Instant.now());
            } else {
                onboarding = new Onboarding(userId, targetRole, targetCompanies, selfRatedSkills, Instant.now());
            }
        }

        try {
            offlineDbService.saveOnboarding(onboarding);
            onboardingRepository.save(onboarding);
        } catch (Exception dbEx) {
            System.err.println("MongoDB Connection Exception in saveOnboarding save: " + dbEx.getMessage());
            offlineDbService.saveOnboarding(onboarding);
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Onboarding information saved successfully"
        ));
    }
}
