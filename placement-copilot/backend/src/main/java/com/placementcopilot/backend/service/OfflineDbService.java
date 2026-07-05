package com.placementcopilot.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.placementcopilot.backend.model.*;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OfflineDbService {

    private final String DB_DIR = "database";
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private final Map<String, User> users = new ConcurrentHashMap<>();
    private final Map<String, Onboarding> onboardings = new ConcurrentHashMap<>();
    private final Map<String, InterviewSession> interviewSessions = new ConcurrentHashMap<>();
    private final Map<String, PlannerFolder> plannerFolders = new ConcurrentHashMap<>();
    private final Map<String, PlannerTask> plannerTasks = new ConcurrentHashMap<>();
    private final Map<String, ResumeReview> resumeReviews = new ConcurrentHashMap<>();
    private final Map<String, XpEvent> xpEvents = new ConcurrentHashMap<>();
    private final Map<String, PracticeSubmission> practiceSubmissions = new ConcurrentHashMap<>();

    private boolean dbOffline = false;

    public boolean isDbOffline() {
        return dbOffline;
    }

    public void setDbOffline(boolean dbOffline) {
        this.dbOffline = dbOffline;
    }

    public Map<String, User> getUsers() { return users; }
    public Map<String, Onboarding> getOnboardings() { return onboardings; }
    public Map<String, InterviewSession> getInterviewSessions() { return interviewSessions; }
    public Map<String, PlannerFolder> getPlannerFolders() { return plannerFolders; }
    public Map<String, PlannerTask> getPlannerTasks() { return plannerTasks; }
    public Map<String, ResumeReview> getResumeReviews() { return resumeReviews; }
    public Map<String, XpEvent> getXpEvents() { return xpEvents; }
    public Map<String, PracticeSubmission> getPracticeSubmissions() { return practiceSubmissions; }

    @PostConstruct
    public void init() {
        File dir = new File(DB_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // Migrate old offline_db.json if it exists and database folder is empty
        File oldDbFile = new File("offline_db.json");
        File newUsersFile = new File(DB_DIR, "users.json");
        if (oldDbFile.exists() && !newUsersFile.exists()) {
            System.out.println("Migrating old offline_db.json to the new database/ directory...");
            try {
                Map<String, Object> data = objectMapper.readValue(oldDbFile, Map.class);
                if (data != null) {
                    if (data.containsKey("users")) {
                        List<Map<String, Object>> userList = (List<Map<String, Object>>) data.get("users");
                        List<User> list = new ArrayList<>();
                        for (Map<String, Object> uMap : userList) {
                            User user = objectMapper.convertValue(uMap, User.class);
                            if (user.getId() != null) {
                                users.put(user.getId(), user);
                                list.add(user);
                            }
                        }
                        saveCollection("users.json", list);
                    }
                    if (data.containsKey("onboardings")) {
                        List<Map<String, Object>> oList = (List<Map<String, Object>>) data.get("onboardings");
                        List<Onboarding> list = new ArrayList<>();
                        for (Map<String, Object> oMap : oList) {
                            Onboarding onboarding = objectMapper.convertValue(oMap, Onboarding.class);
                            if (onboarding.getUserId() != null) {
                                onboardings.put(onboarding.getUserId(), onboarding);
                                list.add(onboarding);
                            }
                        }
                        saveCollection("onboardings.json", list);
                    }
                    if (data.containsKey("interviewSessions")) {
                        List<Map<String, Object>> iList = (List<Map<String, Object>>) data.get("interviewSessions");
                        List<InterviewSession> list = new ArrayList<>();
                        for (Map<String, Object> iMap : iList) {
                            InterviewSession session = objectMapper.convertValue(iMap, InterviewSession.class);
                            if (session.getId() != null) {
                                interviewSessions.put(session.getId(), session);
                                list.add(session);
                            }
                        }
                        saveCollection("interviewSessions.json", list);
                    }
                }
                System.out.println("Migration complete!");
            } catch (Exception e) {
                System.err.println("Migration failed: " + e.getMessage());
            }
        }

        loadData();
    }

    public synchronized void loadData() {
        loadCollection("users.json", User.class, users, User::getId);
        loadCollection("onboardings.json", Onboarding.class, onboardings, Onboarding::getUserId);
        loadCollection("interviewSessions.json", InterviewSession.class, interviewSessions, InterviewSession::getId);
        loadCollection("plannerFolders.json", PlannerFolder.class, plannerFolders, PlannerFolder::getId);
        loadCollection("plannerTasks.json", PlannerTask.class, plannerTasks, PlannerTask::getId);
        loadCollection("resumeReviews.json", ResumeReview.class, resumeReviews, ResumeReview::getId);
        loadCollection("xpEvents.json", XpEvent.class, xpEvents, XpEvent::getId);
        loadCollection("practiceSubmissions.json", PracticeSubmission.class, practiceSubmissions, PracticeSubmission::getId);

        System.out.println("Offline DB loaded: " 
                + users.size() + " users, " 
                + onboardings.size() + " onboardings, " 
                + interviewSessions.size() + " interviews, "
                + plannerFolders.size() + " folders, "
                + plannerTasks.size() + " tasks, "
                + resumeReviews.size() + " reviews, "
                + xpEvents.size() + " xpEvents, "
                + practiceSubmissions.size() + " submissions.");
    }

    private <T> void loadCollection(String filename, Class<T> clazz, Map<String, T> targetMap, java.util.function.Function<T, String> keyExtractor) {
        File file = new File(DB_DIR, filename);
        if (!file.exists()) return;
        try {
            List<T> list = objectMapper.readValue(file, objectMapper.getTypeFactory().constructCollectionType(List.class, clazz));
            if (list != null) {
                for (T item : list) {
                    String key = keyExtractor.apply(item);
                    if (key != null) {
                        targetMap.put(key, item);
                    }
                }
            }
        } catch (IOException e) {
            System.err.println("Failed to load offline collection " + filename + ": " + e.getMessage());
        }
    }

    private <T> void saveCollection(String filename, Collection<T> data) {
        try {
            File file = new File(DB_DIR, filename);
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, new ArrayList<>(data));
        } catch (IOException e) {
            System.err.println("Failed to save offline collection " + filename + ": " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────
    //  User Operations
    // ─────────────────────────────────────────────────────────
    public Optional<User> findUserById(String id) {
        return Optional.ofNullable(users.get(id));
    }

    public Optional<User> findUserByEmail(String email) {
        if (email == null) return Optional.empty();
        String normalizedEmail = email.trim().toLowerCase();
        return users.values().stream()
                .filter(u -> normalizedEmail.equals(u.getEmail()))
                .findFirst();
    }

    public User saveUser(User user) {
        if (user.getId() == null) {
            user.setId("mock-user-id-" + Math.abs(user.getEmail().toLowerCase().hashCode()));
        }
        users.put(user.getId(), user);
        saveCollection("users.json", users.values());
        return user;
    }

    // ─────────────────────────────────────────────────────────
    //  Onboarding Operations
    // ─────────────────────────────────────────────────────────
    public Optional<Onboarding> findOnboardingByUserId(String userId) {
        return Optional.ofNullable(onboardings.get(userId));
    }

    public Onboarding saveOnboarding(Onboarding onboarding) {
        if (onboarding.getId() == null) {
            onboarding.setId(UUID.randomUUID().toString());
        }
        onboardings.put(onboarding.getUserId(), onboarding);
        saveCollection("onboardings.json", onboardings.values());
        return onboarding;
    }

    // ─────────────────────────────────────────────────────────
    //  Interview Session Operations
    // ─────────────────────────────────────────────────────────
    public Optional<InterviewSession> findInterviewSessionById(String id) {
        return Optional.ofNullable(interviewSessions.get(id));
    }

    public InterviewSession saveInterviewSession(InterviewSession session) {
        if (session.getId() == null) {
            session.setId(UUID.randomUUID().toString());
        }
        interviewSessions.put(session.getId(), session);
        saveCollection("interviewSessions.json", interviewSessions.values());
        return session;
    }

    public List<InterviewSession> findInterviewSessionsByUserId(String userId) {
        List<InterviewSession> list = new ArrayList<>();
        for (InterviewSession s : interviewSessions.values()) {
            if (userId.equals(s.getUserId())) {
                list.add(s);
            }
        }
        list.sort(Comparator.comparing(InterviewSession::getCreatedAt).reversed());
        return list;
    }

    // ─────────────────────────────────────────────────────────
    //  Planner Folders Operations
    // ─────────────────────────────────────────────────────────
    public List<PlannerFolder> findPlannerFoldersByUserId(String userId) {
        List<PlannerFolder> list = new ArrayList<>();
        for (PlannerFolder f : plannerFolders.values()) {
            if (userId.equals(f.getUserId())) {
                list.add(f);
            }
        }
        list.sort(Comparator.comparingInt(PlannerFolder::getSortOrder)
                .thenComparing(PlannerFolder::getCreatedAt));
        return list;
    }

    public Optional<PlannerFolder> findPlannerFolderById(String id) {
        return Optional.ofNullable(plannerFolders.get(id));
    }

    public PlannerFolder savePlannerFolder(PlannerFolder folder) {
        if (folder.getId() == null) {
            folder.setId(UUID.randomUUID().toString());
        }
        plannerFolders.put(folder.getId(), folder);
        saveCollection("plannerFolders.json", plannerFolders.values());
        return folder;
    }

    public void deletePlannerFolder(String id) {
        plannerFolders.remove(id);
        saveCollection("plannerFolders.json", plannerFolders.values());
        plannerTasks.values().removeIf(t -> id.equals(t.getFolderId()));
        saveCollection("plannerTasks.json", plannerTasks.values());
    }

    // ─────────────────────────────────────────────────────────
    //  Planner Tasks Operations
    // ─────────────────────────────────────────────────────────
    public List<PlannerTask> findPlannerTasksByUserId(String userId) {
        List<PlannerTask> list = new ArrayList<>();
        for (PlannerTask t : plannerTasks.values()) {
            if (userId.equals(t.getUserId())) {
                list.add(t);
            }
        }
        list.sort(Comparator.comparing(PlannerTask::getCreatedAt).reversed());
        return list;
    }

    public List<PlannerTask> findPlannerTasksByFolderId(String userId, String folderId) {
        List<PlannerTask> list = new ArrayList<>();
        for (PlannerTask t : plannerTasks.values()) {
            if (userId.equals(t.getUserId()) && Objects.equals(folderId, t.getFolderId())) {
                list.add(t);
            }
        }
        list.sort(Comparator.comparing(PlannerTask::getCreatedAt).reversed());
        return list;
    }

    public List<PlannerTask> findPlannerInboxTasks(String userId) {
        List<PlannerTask> list = new ArrayList<>();
        for (PlannerTask t : plannerTasks.values()) {
            if (userId.equals(t.getUserId()) && (t.getFolderId() == null || t.getFolderId().isEmpty())) {
                list.add(t);
            }
        }
        list.sort(Comparator.comparing(PlannerTask::getCreatedAt).reversed());
        return list;
    }

    public Optional<PlannerTask> findPlannerTaskById(String id) {
        return Optional.ofNullable(plannerTasks.get(id));
    }

    public PlannerTask savePlannerTask(PlannerTask task) {
        if (task.getId() == null) {
            task.setId(UUID.randomUUID().toString());
        }
        plannerTasks.put(task.getId(), task);
        saveCollection("plannerTasks.json", plannerTasks.values());
        return task;
    }

    public void deletePlannerTask(String id) {
        plannerTasks.remove(id);
        saveCollection("plannerTasks.json", plannerTasks.values());
    }

    public long countTasksByFolderId(String userId, String folderId) {
        return plannerTasks.values().stream()
                .filter(t -> userId.equals(t.getUserId()) && Objects.equals(folderId, t.getFolderId()))
                .count();
    }

    public long countDoneTasksByFolderId(String userId, String folderId) {
        return plannerTasks.values().stream()
                .filter(t -> userId.equals(t.getUserId()) && Objects.equals(folderId, t.getFolderId()) && "done".equals(t.getStatus()))
                .count();
    }

    public long countTasksByStatus(String userId, String status) {
        return plannerTasks.values().stream()
                .filter(t -> userId.equals(t.getUserId()) && Objects.equals(status, t.getStatus()))
                .count();
    }

    // ─────────────────────────────────────────────────────────
    //  Resume Review Operations
    // ─────────────────────────────────────────────────────────
    public List<ResumeReview> findResumeReviewsByUserId(String userId) {
        List<ResumeReview> list = new ArrayList<>();
        for (ResumeReview r : resumeReviews.values()) {
            if (userId.equals(r.getUserId())) {
                list.add(r);
            }
        }
        list.sort(Comparator.comparing(ResumeReview::getCreatedAt).reversed());
        return list;
    }

    public ResumeReview saveResumeReview(ResumeReview review) {
        if (review.getId() == null) {
            review.setId(UUID.randomUUID().toString());
        }
        resumeReviews.put(review.getId(), review);
        saveCollection("resumeReviews.json", resumeReviews.values());
        return review;
    }

    public long countResumeReviewsByUserId(String userId) {
        return resumeReviews.values().stream()
                .filter(r -> userId.equals(r.getUserId()))
                .count();
    }

    // ─────────────────────────────────────────────────────────
    //  XP Event Operations
    // ─────────────────────────────────────────────────────────
    public List<XpEvent> findXpEventsByUserId(String userId) {
        List<XpEvent> list = new ArrayList<>();
        for (XpEvent e : xpEvents.values()) {
            if (userId.equals(e.getUserId())) {
                list.add(e);
            }
        }
        list.sort(Comparator.comparing(XpEvent::getCreatedAt).reversed());
        return list;
    }

    public XpEvent saveXpEvent(XpEvent event) {
        if (event.getId() == null) {
            event.setId(UUID.randomUUID().toString());
        }
        xpEvents.put(event.getId(), event);
        saveCollection("xpEvents.json", xpEvents.values());
        return event;
    }

    // ─────────────────────────────────────────────────────────
    //  Practice Submission Operations
    // ─────────────────────────────────────────────────────────
    public List<PracticeSubmission> findPracticeSubmissionsByUserId(String userId) {
        List<PracticeSubmission> list = new ArrayList<>();
        for (PracticeSubmission s : practiceSubmissions.values()) {
            if (userId.equals(s.getUserId())) {
                list.add(s);
            }
        }
        list.sort(Comparator.comparing(PracticeSubmission::getSubmittedAt).reversed());
        return list;
    }

    public List<PracticeSubmission> findPracticeSubmissionsByUserIdAndModule(String userId, String module) {
        List<PracticeSubmission> list = new ArrayList<>();
        for (PracticeSubmission s : practiceSubmissions.values()) {
            if (userId.equals(s.getUserId()) && module.equals(s.getModule())) {
                list.add(s);
            }
        }
        list.sort(Comparator.comparing(PracticeSubmission::getSubmittedAt).reversed());
        return list;
    }

    public List<PracticeSubmission> findPracticeSubmissionsByUserIdAndModuleAndProblemId(String userId, String module, String problemId) {
        List<PracticeSubmission> list = new ArrayList<>();
        for (PracticeSubmission s : practiceSubmissions.values()) {
            if (userId.equals(s.getUserId()) && module.equals(s.getModule()) && problemId.equals(s.getProblemId())) {
                list.add(s);
            }
        }
        list.sort(Comparator.comparing(PracticeSubmission::getSubmittedAt).reversed());
        return list;
    }

    public PracticeSubmission savePracticeSubmission(PracticeSubmission submission) {
        if (submission.getId() == null) {
            submission.setId(UUID.randomUUID().toString());
        }
        practiceSubmissions.put(submission.getId(), submission);
        saveCollection("practiceSubmissions.json", practiceSubmissions.values());
        return submission;
    }
}
