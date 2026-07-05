package com.placementcopilot.backend.service;

import com.placementcopilot.backend.model.*;
import com.placementcopilot.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class DbMigrationService implements CommandLineRunner {

    @Autowired
    private OfflineDbService offlineDbService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OnboardingRepository onboardingRepository;

    @Autowired
    private InterviewSessionRepository interviewSessionRepository;

    @Autowired
    private PlannerFolderRepository plannerFolderRepository;

    @Autowired
    private PlannerTaskRepository plannerTaskRepository;

    @Autowired
    private ResumeReviewRepository resumeReviewRepository;

    @Autowired
    private XpEventRepository xpEventRepository;

    @Autowired
    private PracticeSubmissionRepository practiceSubmissionRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("----------------------------------------------------------------------");
        System.out.println("🚀 [MongoDB Migration] Checking MongoDB Cloud for pending migrations...");
        System.out.println("----------------------------------------------------------------------");
        try {
            // Ensure data is loaded in OfflineDbService
            offlineDbService.loadData();

            // 1. Users
            long migratedUsers = 0;
            for (User u : offlineDbService.getUsers().values()) {
                if (userRepository.findById(u.getId()).isEmpty()) {
                    userRepository.save(u);
                    migratedUsers++;
                }
            }
            if (migratedUsers > 0) System.out.println("✅ Migrated " + migratedUsers + " users to MongoDB.");

            // 2. Onboardings
            long migratedOnboardings = 0;
            for (Onboarding o : offlineDbService.getOnboardings().values()) {
                if (onboardingRepository.findById(o.getId()).isEmpty()) {
                    onboardingRepository.save(o);
                    migratedOnboardings++;
                }
            }
            if (migratedOnboardings > 0) System.out.println("✅ Migrated " + migratedOnboardings + " onboardings to MongoDB.");

            // 3. Interview Sessions
            long migratedInterviews = 0;
            for (InterviewSession s : offlineDbService.getInterviewSessions().values()) {
                if (interviewSessionRepository.findById(s.getId()).isEmpty()) {
                    interviewSessionRepository.save(s);
                    migratedInterviews++;
                }
            }
            if (migratedInterviews > 0) System.out.println("✅ Migrated " + migratedInterviews + " mock interviews to MongoDB.");

            // 4. Planner Folders
            long migratedFolders = 0;
            for (PlannerFolder f : offlineDbService.getPlannerFolders().values()) {
                if (plannerFolderRepository.findById(f.getId()).isEmpty()) {
                    plannerFolderRepository.save(f);
                    migratedFolders++;
                }
            }
            if (migratedFolders > 0) System.out.println("✅ Migrated " + migratedFolders + " planner folders to MongoDB.");

            // 5. Planner Tasks
            long migratedTasks = 0;
            for (PlannerTask t : offlineDbService.getPlannerTasks().values()) {
                if (plannerTaskRepository.findById(t.getId()).isEmpty()) {
                    plannerTaskRepository.save(t);
                    migratedTasks++;
                }
            }
            if (migratedTasks > 0) System.out.println("✅ Migrated " + migratedTasks + " planner tasks to MongoDB.");

            // 6. Resume Reviews
            long migratedReviews = 0;
            for (ResumeReview r : offlineDbService.getResumeReviews().values()) {
                if (resumeReviewRepository.findById(r.getId()).isEmpty()) {
                    resumeReviewRepository.save(r);
                    migratedReviews++;
                }
            }
            if (migratedReviews > 0) System.out.println("✅ Migrated " + migratedReviews + " resume reviews to MongoDB.");

            // 7. XP Events
            long migratedXp = 0;
            for (XpEvent e : offlineDbService.getXpEvents().values()) {
                if (xpEventRepository.findById(e.getId()).isEmpty()) {
                    xpEventRepository.save(e);
                    migratedXp++;
                }
            }
            if (migratedXp > 0) System.out.println("✅ Migrated " + migratedXp + " XP events to MongoDB.");

            // 8. Practice Submissions
            long migratedSubmissions = 0;
            for (PracticeSubmission s : offlineDbService.getPracticeSubmissions().values()) {
                if (practiceSubmissionRepository.findById(s.getId()).isEmpty()) {
                    practiceSubmissionRepository.save(s);
                    migratedSubmissions++;
                }
            }
            if (migratedSubmissions > 0) System.out.println("✅ Migrated " + migratedSubmissions + " practice submissions to MongoDB.");

            System.out.println("🎉 [MongoDB Migration] Migration complete! All offline data is synced to MongoDB Cloud.");
            System.out.println("----------------------------------------------------------------------");
        } catch (Exception e) {
            System.err.println("❌ [MongoDB Migration] Failed to migrate local data to MongoDB Cloud: " + e.getMessage());
            System.out.println("----------------------------------------------------------------------");
        }
    }
}
