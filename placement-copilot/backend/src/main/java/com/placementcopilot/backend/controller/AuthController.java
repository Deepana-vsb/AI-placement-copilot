package com.placementcopilot.backend.controller;

import com.placementcopilot.backend.model.User;
import com.placementcopilot.backend.model.Onboarding;
import com.placementcopilot.backend.repository.UserRepository;
import com.placementcopilot.backend.repository.OnboardingRepository;
import com.placementcopilot.backend.service.JwtUtil;
import com.placementcopilot.backend.service.OfflineDbService;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OnboardingRepository onboardingRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OfflineDbService offlineDbService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body, HttpServletResponse response) {
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");
        String college = body.get("college");
        String branchYear = body.get("branchYear");
        String location = body.get("location");

        if (name == null || email == null || password == null || college == null || branchYear == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "All fields are required"));
        }

        Optional<User> existingUser = Optional.empty();
        try {
            existingUser = userRepository.findByEmail(email.toLowerCase());
        } catch (Exception dbEx) {
            System.err.println("MongoDB Connection Exception in signup findByEmail: " + dbEx.getMessage());
            existingUser = offlineDbService.findUserByEmail(email.toLowerCase());
        }

        if (existingUser.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User with this email already exists"));
        }

        String passwordHash = BCrypt.hashpw(password, BCrypt.gensalt());

        User user = new User(name, email.toLowerCase(), passwordHash, college, branchYear, Instant.now());
        if (location != null && !location.trim().isEmpty()) {
            user.setLocation(location);
        }
        
        User savedUser;
        try {
            offlineDbService.saveUser(user);
            savedUser = userRepository.save(user);
        } catch (Exception dbEx) {
            System.err.println("MongoDB Connection Exception in signup save: " + dbEx.getMessage());
            savedUser = offlineDbService.saveUser(user);
        }

        String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getEmail());

        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        response.addCookie(cookie);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("user", Map.of(
            "id", savedUser.getId(),
            "name", savedUser.getName(),
            "email", savedUser.getEmail(),
            "college", savedUser.getCollege(),
            "branchYear", savedUser.getBranchYear()
        ));

        return ResponseEntity.ok(res);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpServletResponse response) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        User user;
        boolean onboarded = true;

        try {
            if (offlineDbService.isDbOffline()) {
                throw new RuntimeException("Database flagged offline");
            }
            Optional<User> userOpt = userRepository.findByEmail(email.toLowerCase());
            if (userOpt.isEmpty()) {
                // Auto register the user if they do not exist
                String plainPassword = password != null ? password : "password123";
                String passwordHash = BCrypt.hashpw(plainPassword, BCrypt.gensalt());
                String defaultName = extractDefaultName(email);
                user = new User(defaultName, email.toLowerCase(), passwordHash, "Placement University", "2024", Instant.now());
                offlineDbService.saveUser(user);
                user = userRepository.save(user);
            } else {
                user = userOpt.get();
                offlineDbService.saveUser(user); // Sync local copy
            }
            onboarded = onboardingRepository.findByUserId(user.getId()).isPresent();
        } catch (Exception dbEx) {
            offlineDbService.setDbOffline(true);
            System.err.println("MongoDB Connection Exception: " + dbEx.getMessage() + ". Using local offline user session.");
            user = offlineDbService.findUserByEmail(email.toLowerCase()).orElse(null);
            if (user == null) {
                String mockId = "mock-user-id-" + Math.abs(email.toLowerCase().hashCode());
                String defaultName = extractDefaultName(email);
                user = new User(defaultName, email.toLowerCase(), "mock-hash", "Placement University", "2024", Instant.now());
                user.setId(mockId);
                offlineDbService.saveUser(user);
            }
            onboarded = offlineDbService.findOnboardingByUserId(user.getId()).isPresent();
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());

        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        response.addCookie(cookie);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("onboarded", onboarded);
        res.put("user", buildUserMap(user));

        return ResponseEntity.ok(res);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("token", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0); // Expire immediately
        response.addCookie(cookie);

        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.ok(Map.of("authenticated", false));
        }

        User user = null;
        boolean onboarded = true;
        String targetRole = null;

        try {
            if (offlineDbService.isDbOffline()) {
                throw new RuntimeException("Database flagged offline");
            }
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                user = userOpt.get();
                Optional<Onboarding> onboardingOpt = onboardingRepository.findByUserId(userId);
                onboarded = onboardingOpt.isPresent();
                targetRole = onboardingOpt.map(Onboarding::getTargetRole).orElse(null);
            }
        } catch (Exception dbEx) {
            offlineDbService.setDbOffline(true);
            System.err.println("MongoDB Connection Exception in getMe: " + dbEx.getMessage());
        }

        if (user == null) {
            user = offlineDbService.findUserById(userId).orElse(null);
            if (user == null) {
                String defaultName = extractDefaultName("deepana1305@gmail.com");
                user = new User(defaultName, "deepana1305@gmail.com", "mock-hash", "Placement University", "2024", Instant.now());
                user.setId(userId);
                offlineDbService.saveUser(user);
            }
            Optional<Onboarding> oOpt = offlineDbService.findOnboardingByUserId(userId);
            onboarded = oOpt.isPresent();
            targetRole = oOpt.map(Onboarding::getTargetRole).orElse(null);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("authenticated", true);
        res.put("user", buildUserMap(user));
        res.put("onboarded", onboarded);
        res.put("targetRole", targetRole);

        return ResponseEntity.ok(res);
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body, HttpServletResponse response) {
        String email = body.get("email");
        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        User user;
        boolean onboarded = true;

        try {
            if (offlineDbService.isDbOffline()) {
                throw new RuntimeException("Database flagged offline");
            }
            Optional<User> userOpt = userRepository.findByEmail(email.toLowerCase());
            if (userOpt.isEmpty()) {
                String name = body.getOrDefault("name", "Google User");
                String college = body.getOrDefault("college", "Google University");
                String branchYear = body.getOrDefault("branchYear", "2024");
                String passwordHash = BCrypt.hashpw(UUID.randomUUID().toString(), BCrypt.gensalt());
                user = new User(name, email.toLowerCase(), passwordHash, college, branchYear, Instant.now());
                
                // Sync profile picture from Google payload
                if (body.containsKey("picture")) {
                    user.setProfilePicture(body.get("picture"));
                }

                offlineDbService.saveUser(user);
                user = userRepository.save(user);
            } else {
                user = userOpt.get();
                if (body.containsKey("picture") && (user.getProfilePicture() == null || user.getProfilePicture().isEmpty())) {
                    user.setProfilePicture(body.get("picture"));
                    userRepository.save(user);
                }
                offlineDbService.saveUser(user);
            }
            onboarded = onboardingRepository.findByUserId(user.getId()).isPresent();
        } catch (Exception dbEx) {
            offlineDbService.setDbOffline(true);
            System.err.println("MongoDB Connection Exception in googleLogin: " + dbEx.getMessage());
            user = offlineDbService.findUserByEmail(email.toLowerCase()).orElse(null);
            if (user == null) {
                String mockId = "mock-google-id-" + Math.abs(email.toLowerCase().hashCode());
                String name = body.getOrDefault("name", "Google User");
                user = new User(name, email.toLowerCase(), "mock-hash", "Google University", "2024", Instant.now());
                user.setId(mockId);
                if (body.containsKey("picture")) {
                    user.setProfilePicture(body.get("picture"));
                }
                offlineDbService.saveUser(user);
            }
            onboarded = offlineDbService.findOnboardingByUserId(user.getId()).isPresent();
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());

        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        response.addCookie(cookie);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("onboarded", onboarded);
        res.put("user", buildUserMap(user));

        return ResponseEntity.ok(res);
    }

    @PostMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        User user = null;
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                user = userOpt.get();
            }
        } catch (Exception dbEx) {
            System.err.println("MongoDB Connection Exception in updateProfile: " + dbEx.getMessage());
        }

        if (user == null) {
            user = offlineDbService.findUserById(userId).orElse(null);
        }

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }

        // Update fields
        if (body.containsKey("name")) user.setName((String) body.get("name"));
        if (body.containsKey("college")) user.setCollege((String) body.get("college"));
        if (body.containsKey("branchYear")) user.setBranchYear((String) body.get("branchYear"));
        if (body.containsKey("dob")) user.setDob((String) body.get("dob"));
        if (body.containsKey("location")) user.setLocation((String) body.get("location"));
        if (body.containsKey("phone")) user.setPhone((String) body.get("phone"));
        if (body.containsKey("profilePicture")) user.setProfilePicture((String) body.get("profilePicture"));

        if (body.containsKey("cgpa")) {
            Object val = body.get("cgpa");
            if (val instanceof Number) {
                user.setCgpa(((Number) val).doubleValue());
            } else if (val instanceof String && !((String) val).trim().isEmpty()) {
                user.setCgpa(Double.parseDouble((String) val));
            } else {
                user.setCgpa(null);
            }
        }

        if (body.containsKey("tenthMark")) {
            Object val = body.get("tenthMark");
            if (val instanceof Number) {
                user.setTenthMark(((Number) val).doubleValue());
            } else if (val instanceof String && !((String) val).trim().isEmpty()) {
                user.setTenthMark(Double.parseDouble((String) val));
            } else {
                user.setTenthMark(null);
            }
        }

        if (body.containsKey("twelfthMark")) {
            Object val = body.get("twelfthMark");
            if (val instanceof Number) {
                user.setTwelfthMark(((Number) val).doubleValue());
            } else if (val instanceof String && !((String) val).trim().isEmpty()) {
                user.setTwelfthMark(Double.parseDouble((String) val));
            } else {
                user.setTwelfthMark(null);
            }
        }

        // Update targetRole in Onboarding
        if (body.containsKey("targetRole")) {
            String targetRole = (String) body.get("targetRole");
            Onboarding onboarding = null;
            try {
                Optional<Onboarding> oOpt = onboardingRepository.findByUserId(userId);
                if (oOpt.isPresent()) {
                    onboarding = oOpt.get();
                }
            } catch (Exception dbEx) {
                System.err.println("MongoDB Connection Exception: " + dbEx.getMessage());
            }

            if (onboarding == null) {
                onboarding = offlineDbService.findOnboardingByUserId(userId).orElse(null);
            }

            if (onboarding == null) {
                onboarding = new Onboarding(userId, targetRole, new ArrayList<>(), new HashMap<>(), Instant.now());
            } else {
                onboarding.setTargetRole(targetRole);
            }

            try {
                offlineDbService.saveOnboarding(onboarding);
                onboardingRepository.save(onboarding);
            } catch (Exception dbEx) {
                System.err.println("MongoDB Connection Exception: " + dbEx.getMessage());
                offlineDbService.saveOnboarding(onboarding);
            }
        }

        // Save User
        try {
            offlineDbService.saveUser(user);
            userRepository.save(user);
        } catch (Exception dbEx) {
            System.err.println("MongoDB Connection Exception: " + dbEx.getMessage());
            offlineDbService.saveUser(user);
        }

        return ResponseEntity.ok(Map.of("success", true, "user", buildUserMap(user)));
    }

    @PostMapping("/upgrade")
    public ResponseEntity<?> upgradeToPro(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        User user = null;
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                user = userOpt.get();
            }
        } catch (Exception dbEx) {
            System.err.println("MongoDB Connection Exception in upgradeToPro: " + dbEx.getMessage());
        }

        if (user == null) {
            user = offlineDbService.findUserById(userId).orElse(null);
        }

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }

        user.setPro(true);

        try {
            offlineDbService.saveUser(user);
            userRepository.save(user);
        } catch (Exception dbEx) {
            System.err.println("MongoDB Connection Exception: " + dbEx.getMessage());
            offlineDbService.saveUser(user);
        }

        return ResponseEntity.ok(Map.of("success", true, "user", buildUserMap(user)));
    }

    private Map<String, Object> buildUserMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("name", user.getName());
        map.put("email", user.getEmail());
        map.put("college", user.getCollege());
        map.put("branchYear", user.getBranchYear());
        map.put("dob", user.getDob());
        map.put("location", user.getLocation());
        map.put("phone", user.getPhone());
        map.put("cgpa", user.getCgpa());
        map.put("tenthMark", user.getTenthMark());
        map.put("twelfthMark", user.getTwelfthMark());
        map.put("profilePicture", user.getProfilePicture());
        map.put("isPro", user.isPro());
        return map;
    }

    private String extractDefaultName(String email) {
        if (email == null || !email.contains("@")) return "Candidate";
        String part = email.substring(0, email.indexOf("@"));
        if (part.isEmpty()) return "Candidate";
        return part.substring(0, 1).toUpperCase() + part.substring(1);
    }
}
