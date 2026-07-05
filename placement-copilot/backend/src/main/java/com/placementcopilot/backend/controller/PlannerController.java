package com.placementcopilot.backend.controller;

import com.placementcopilot.backend.model.PlannerFolder;
import com.placementcopilot.backend.model.PlannerTask;
import com.placementcopilot.backend.model.XpEvent;
import com.placementcopilot.backend.repository.PlannerFolderRepository;
import com.placementcopilot.backend.repository.PlannerTaskRepository;
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
@RequestMapping("/api/planner")
public class PlannerController {

    @Autowired
    private PlannerFolderRepository plannerFolderRepository;

    @Autowired
    private PlannerTaskRepository plannerTaskRepository;

    @Autowired
    private XpEventRepository xpEventRepository;

    @Autowired
    private OfflineDbService offlineDbService;

    // ─────────────────────────────────────────────────────────
    //  FOLDERS
    // ─────────────────────────────────────────────────────────

    /** GET all folders with their task counts */
    @GetMapping("/folders")
    public ResponseEntity<?> getFolders(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) return unauthorized();

        try {
            if (offlineDbService.isDbOffline()) {
                throw new RuntimeException("Database flagged offline");
            }

            List<PlannerFolder> folders = plannerFolderRepository
                    .findByUserIdOrderBySortOrderAscCreatedAtAsc(userId);

            List<Map<String, Object>> result = new ArrayList<>();
            for (PlannerFolder folder : folders) {
                long total = plannerTaskRepository.countByUserIdAndFolderId(userId, folder.getId());
                long done  = plannerTaskRepository.countByUserIdAndFolderIdAndStatus(userId, folder.getId(), "done");
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", folder.getId());
                item.put("name", folder.getName());
                item.put("description", folder.getDescription());
                item.put("icon", folder.getIcon());
                item.put("color", folder.getColor());
                item.put("sortOrder", folder.getSortOrder());
                item.put("createdAt", folder.getCreatedAt());
                item.put("taskCount", total);
                item.put("doneCount", done);
                result.add(item);
            }

            long inboxTotal = plannerTaskRepository.findByUserIdAndFolderIdIsNullOrderByCreatedAtDesc(userId).size();

            return ResponseEntity.ok(Map.of("folders", result, "inboxCount", inboxTotal));
        } catch (Exception e) {
            offlineDbService.setDbOffline(true);
            System.err.println("MongoDB Connection Exception in getFolders: " + e.getMessage() + ". Returning offline folders.");
            
            List<PlannerFolder> folders = offlineDbService.findPlannerFoldersByUserId(userId);
            List<Map<String, Object>> result = new ArrayList<>();
            for (PlannerFolder folder : folders) {
                long total = offlineDbService.countTasksByFolderId(userId, folder.getId());
                long done  = offlineDbService.countDoneTasksByFolderId(userId, folder.getId());
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", folder.getId());
                item.put("name", folder.getName());
                item.put("description", folder.getDescription());
                item.put("icon", folder.getIcon());
                item.put("color", folder.getColor());
                item.put("sortOrder", folder.getSortOrder());
                item.put("createdAt", folder.getCreatedAt());
                item.put("taskCount", total);
                item.put("doneCount", done);
                result.add(item);
            }

            long inboxTotal = offlineDbService.findPlannerInboxTasks(userId).size();
            return ResponseEntity.ok(Map.of("folders", result, "inboxCount", inboxTotal));
        }
    }

    /** POST create a folder */
    @PostMapping("/folders")
    public ResponseEntity<?> createFolder(@RequestBody Map<String, Object> body,
                                          HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) return unauthorized();

        try {
            String name = (String) body.get("name");
            if (name == null || name.trim().isEmpty())
                return ResponseEntity.badRequest().body(Map.of("error", "Folder name is required"));

            long count = 0;
            if (!offlineDbService.isDbOffline()) {
                try {
                    count = plannerFolderRepository.countByUserId(userId);
                } catch (Exception e) {
                    offlineDbService.setDbOffline(true);
                }
            }

            if (offlineDbService.isDbOffline()) {
                count = offlineDbService.findPlannerFoldersByUserId(userId).size();
            }

            PlannerFolder folder = new PlannerFolder(
                userId,
                name.trim(),
                body.getOrDefault("description", "").toString(),
                body.getOrDefault("icon", "📁").toString(),
                body.getOrDefault("color", "#6366f1").toString(),
                (int) count,
                Instant.now(),
                Instant.now()
            );

            if (!offlineDbService.isDbOffline()) {
                try {
                    folder = plannerFolderRepository.save(folder);
                } catch (Exception e) {
                    offlineDbService.setDbOffline(true);
                    folder.setId(UUID.randomUUID().toString());
                }
            } else {
                folder.setId(UUID.randomUUID().toString());
            }

            // Always sync to local JSON
            offlineDbService.savePlannerFolder(folder);

            return ResponseEntity.ok(folder);
        } catch (Exception e) {
            e.printStackTrace();
            return internalError("Failed to create folder");
        }
    }

    /** PATCH update a folder */
    @PatchMapping("/folders/{folderId}")
    public ResponseEntity<?> updateFolder(@PathVariable String folderId,
                                          @RequestBody Map<String, Object> body,
                                          HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) return unauthorized();

        try {
            PlannerFolder folder = null;
            if (!offlineDbService.isDbOffline()) {
                try {
                    Optional<PlannerFolder> opt = plannerFolderRepository.findById(folderId);
                    if (opt.isPresent() && opt.get().getUserId().equals(userId)) {
                        folder = opt.get();
                    }
                } catch (Exception e) {
                    offlineDbService.setDbOffline(true);
                }
            }

            if (folder == null) {
                folder = offlineDbService.findPlannerFolderById(folderId).orElse(null);
            }

            if (folder == null) {
                folder = new PlannerFolder(userId, "Folder", "", "📁", "#6366f1", 0, Instant.now(), Instant.now());
                folder.setId(folderId);
            }

            if (body.containsKey("name")) folder.setName(body.get("name").toString().trim());
            if (body.containsKey("description")) folder.setDescription(body.get("description").toString());
            if (body.containsKey("icon")) folder.setIcon(body.get("icon").toString());
            if (body.containsKey("color")) folder.setColor(body.get("color").toString());
            if (body.containsKey("sortOrder")) folder.setSortOrder((int) body.get("sortOrder"));
            folder.setUpdatedAt(Instant.now());

            if (!offlineDbService.isDbOffline()) {
                try {
                    folder = plannerFolderRepository.save(folder);
                } catch (Exception e) {
                    offlineDbService.setDbOffline(true);
                }
            }

            // Always sync to local JSON
            offlineDbService.savePlannerFolder(folder);

            return ResponseEntity.ok(folder);
        } catch (Exception e) {
            e.printStackTrace();
            return internalError("Failed to update folder");
        }
    }

    /** DELETE a folder and all its tasks */
    @DeleteMapping("/folders/{folderId}")
    public ResponseEntity<?> deleteFolder(@PathVariable String folderId,
                                          HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) return unauthorized();

        try {
            if (!offlineDbService.isDbOffline()) {
                try {
                    plannerTaskRepository.deleteByFolderId(folderId);
                    plannerFolderRepository.deleteById(folderId);
                } catch (Exception e) {
                    offlineDbService.setDbOffline(true);
                }
            }
            
            // Always sync to local JSON
            offlineDbService.deletePlannerFolder(folderId);
            
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            e.printStackTrace();
            return internalError("Failed to delete folder");
        }
    }

    // ─────────────────────────────────────────────────────────
    //  TASKS
    // ─────────────────────────────────────────────────────────

    /** GET all tasks (optionally filtered by folderId) */
    @GetMapping("/tasks")
    public ResponseEntity<?> getTasks(@RequestParam(required = false) String folderId,
                                      HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) return unauthorized();

        try {
            if (offlineDbService.isDbOffline()) {
                throw new RuntimeException("Database flagged offline");
            }

            List<PlannerTask> tasks;
            if ("inbox".equals(folderId)) {
                tasks = plannerTaskRepository.findByUserIdAndFolderIdIsNullOrderByCreatedAtDesc(userId);
            } else if (folderId != null && !folderId.isEmpty()) {
                tasks = plannerTaskRepository.findByUserIdAndFolderIdOrderByCreatedAtDesc(userId, folderId);
            } else {
                tasks = plannerTaskRepository.findByUserIdOrderByCreatedAtDesc(userId);
            }

            long doneCount = plannerTaskRepository.countByUserIdAndStatus(userId, "done");
            long totalCount = plannerTaskRepository.countByUserIdAndStatus(userId, "todo")
                            + plannerTaskRepository.countByUserIdAndStatus(userId, "in_progress")
                            + doneCount;

            return ResponseEntity.ok(Map.of(
                "tasks", tasks,
                "stats", Map.of(
                    "total", totalCount,
                    "done", doneCount,
                    "inProgress", plannerTaskRepository.countByUserIdAndStatus(userId, "in_progress"),
                    "todo", plannerTaskRepository.countByUserIdAndStatus(userId, "todo")
                )
            ));
        } catch (Exception e) {
            offlineDbService.setDbOffline(true);
            System.err.println("MongoDB Connection Exception in getTasks: " + e.getMessage() + ". Returning offline tasks.");
            
            List<PlannerTask> tasks;
            if ("inbox".equals(folderId)) {
                tasks = offlineDbService.findPlannerInboxTasks(userId);
            } else if (folderId != null && !folderId.isEmpty()) {
                tasks = offlineDbService.findPlannerTasksByFolderId(userId, folderId);
            } else {
                tasks = offlineDbService.findPlannerTasksByUserId(userId);
            }

            long doneCount = offlineDbService.countTasksByStatus(userId, "done");
            long totalCount = offlineDbService.countTasksByStatus(userId, "todo")
                            + offlineDbService.countTasksByStatus(userId, "in_progress")
                            + doneCount;

            return ResponseEntity.ok(Map.of(
                "tasks", tasks,
                "stats", Map.of(
                    "total", totalCount,
                    "done", doneCount,
                    "inProgress", offlineDbService.countTasksByStatus(userId, "in_progress"),
                    "todo", offlineDbService.countTasksByStatus(userId, "todo")
                )
            ));
        }
    }

    /** POST create a task (optionally inside a folder) */
    @PostMapping("/tasks")
    public ResponseEntity<?> createTask(@RequestBody Map<String, String> body,
                                        HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) return unauthorized();

        try {
            String title = body.get("title");
            if (title == null || title.trim().isEmpty())
                return ResponseEntity.badRequest().body(Map.of("error", "Title is required"));

            String folderId = body.get("folderId"); // may be null → Inbox

            PlannerTask task = new PlannerTask(
                userId,
                folderId,
                title.trim(),
                body.getOrDefault("description", ""),
                body.getOrDefault("category", "General"),
                body.getOrDefault("priority", "medium"),
                "todo",
                body.getOrDefault("dueDate", ""),
                Instant.now(),
                Instant.now()
            );

            if (!offlineDbService.isDbOffline()) {
                try {
                    task = plannerTaskRepository.save(task);
                } catch (Exception e) {
                    offlineDbService.setDbOffline(true);
                    task.setId(UUID.randomUUID().toString());
                }
            } else {
                task.setId(UUID.randomUUID().toString());
            }

            // Always sync to local JSON
            offlineDbService.savePlannerTask(task);

            return ResponseEntity.ok(task);
        } catch (Exception e) {
            e.printStackTrace();
            return internalError("Failed to create task");
        }
    }

    /** PATCH update a task */
    @PatchMapping("/tasks/{taskId}")
    public ResponseEntity<?> updateTask(@PathVariable String taskId,
                                        @RequestBody Map<String, String> body,
                                        HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) return unauthorized();

        try {
            PlannerTask task = null;
            if (!offlineDbService.isDbOffline()) {
                try {
                    Optional<PlannerTask> opt = plannerTaskRepository.findById(taskId);
                    if (opt.isPresent() && opt.get().getUserId().equals(userId)) {
                        task = opt.get();
                    }
                } catch (Exception e) {
                    offlineDbService.setDbOffline(true);
                }
            }

            if (task == null) {
                task = offlineDbService.findPlannerTaskById(taskId).orElse(null);
            }

            if (task == null) {
                task = new PlannerTask(userId, null, "Task", "", "General", "medium", "todo", "", Instant.now(), Instant.now());
                task.setId(taskId);
            }

            String previousStatus = task.getStatus();

            if (body.containsKey("title"))       task.setTitle(body.get("title"));
            if (body.containsKey("description")) task.setDescription(body.get("description"));
            if (body.containsKey("category"))    task.setCategory(body.get("category"));
            if (body.containsKey("priority"))    task.setPriority(body.get("priority"));
            if (body.containsKey("dueDate"))     task.setDueDate(body.get("dueDate"));
            if (body.containsKey("status"))      task.setStatus(body.get("status"));
            if (body.containsKey("folderId"))    task.setFolderId(body.get("folderId"));
            task.setUpdatedAt(Instant.now());

            if (!offlineDbService.isDbOffline()) {
                try {
                    task = plannerTaskRepository.save(task);
                } catch (Exception e) {
                    offlineDbService.setDbOffline(true);
                }
            }

            // Always sync to local JSON
            offlineDbService.savePlannerTask(task);

            // Award XP when task is marked done for the first time
            if ("done".equals(body.get("status")) && !"done".equals(previousStatus)) {
                XpEvent event = new XpEvent(userId, 50, "Completed planner task: " + task.getTitle(), Instant.now());
                try {
                    if (!offlineDbService.isDbOffline()) {
                        xpEventRepository.save(event);
                    }
                } catch (Exception e) {
                    offlineDbService.setDbOffline(true);
                }
                // Always sync to local JSON
                offlineDbService.saveXpEvent(event);
            }

            return ResponseEntity.ok(task);
        } catch (Exception e) {
            e.printStackTrace();
            return internalError("Failed to update task");
        }
    }

    /** DELETE a task */
    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<?> deleteTask(@PathVariable String taskId,
                                        HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) return unauthorized();

        try {
            if (!offlineDbService.isDbOffline()) {
                try {
                    plannerTaskRepository.deleteById(taskId);
                } catch (Exception e) {
                    offlineDbService.setDbOffline(true);
                }
            }

            // Always sync to local JSON
            offlineDbService.deletePlannerTask(taskId);

            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            e.printStackTrace();
            return internalError("Failed to delete task");
        }
    }

    // ─────────────────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────────────────
    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
    }

    private ResponseEntity<?> internalError(String msg) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", msg));
    }
}
