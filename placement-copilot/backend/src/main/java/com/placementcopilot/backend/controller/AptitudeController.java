package com.placementcopilot.backend.controller;

import com.placementcopilot.backend.model.Onboarding;
import com.placementcopilot.backend.repository.OnboardingRepository;
import com.placementcopilot.backend.service.GroqService;
import com.placementcopilot.backend.service.OfflineDbService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;

@RestController
@RequestMapping("/api/aptitude")
public class AptitudeController {

    @Autowired
    private OnboardingRepository onboardingRepository;

    @Autowired
    private GroqService groqService;

    @Autowired
    private OfflineDbService offlineDbService;

    @GetMapping("/questions")
    public ResponseEntity<?> getQuestions(
            @RequestParam(value = "count", defaultValue = "5") int count,
            @RequestParam(value = "topic", defaultValue = "General Aptitude") String topic,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        String targetRole = "Software Engineer";
        String companies = "Google, TCS, Infosys, Amazon, Meta";

        Optional<Onboarding> onboardingOpt = Optional.empty();
        try {
            if (!offlineDbService.isDbOffline()) {
                onboardingOpt = onboardingRepository.findByUserId(userId);
            }
        } catch (Exception dbEx) {
            offlineDbService.setDbOffline(true);
            System.err.println("MongoDB Connection Exception in AptitudeController: " + dbEx.getMessage());
        }

        if (onboardingOpt.isEmpty()) {
            onboardingOpt = offlineDbService.findOnboardingByUserId(userId);
        }

        if (onboardingOpt.isPresent()) {
            Onboarding onboarding = onboardingOpt.get();
            if (onboarding.getTargetRole() != null) {
                targetRole = onboarding.getTargetRole();
            }
            if (onboarding.getTargetCompanies() != null && !onboarding.getTargetCompanies().isEmpty()) {
                companies = String.join(", ", onboarding.getTargetCompanies());
            }
        }

        try {
            String systemPrompt = "You are a professional technical recruiter and aptitude examiner. " +
                    "Generate exactly " + count + " high-quality quantitative, logical, or technology aptitude questions " +
                    "specifically on the topic: '" + topic + "'. " +
                    "Sourced from real-world placement papers of companies: " + companies + ", tailored for a " + targetRole + ". " +
                    "Focus on current technologies combined with analytical aptitude relative to this topic.\n" +
                    "Respond with a raw JSON array matching this exact format:\n" +
                    "[\n" +
                    "  {\n" +
                    "    \"id\": 1,\n" +
                    "    \"question\": \"Question text here\",\n" +
                    "    \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\n" +
                    "    \"correctIdx\": 0,\n" +
                    "    \"explanation\": \"Step-by-step mathematical or logical explanation\"\n" +
                    "  }\n" +
                    "]\n" +
                    "Do not wrap the output in markdown code blocks or add any other text outside the JSON array.";

            List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", "Generate " + count + " customized aptitude questions now.")
            );

            String groqResponse = groqService.callChatCompletion(messages, 0.2);
            // Clean markdown wrap if any
            groqResponse = groqResponse.trim();
            if (groqResponse.startsWith("```")) {
                int firstLineBreak = groqResponse.indexOf("\n");
                int lastBackticks = groqResponse.lastIndexOf("```");
                if (firstLineBreak != -1 && lastBackticks != -1 && lastBackticks > firstLineBreak) {
                    groqResponse = groqResponse.substring(firstLineBreak + 1, lastBackticks).trim();
                }
            }

            return ResponseEntity.ok(groqResponse);
        } catch (Exception e) {
            e.printStackTrace();
            // Fallback default questions if Groq API fails or is not ready
            return ResponseEntity.ok(getDefaultQuestions(targetRole, companies));
        }
    }

    private List<Map<String, Object>> getDefaultQuestions(String role, String companies) {
        List<Map<String, Object>> list = new ArrayList<>();
        
        list.add(Map.of(
            "id", 1,
            "question", "In an AI/ML distributed training system on AWS, 3 parameter servers and 6 worker nodes are connected. If the probability of a worker node failing during an epoch is 0.1, and the training fails if more than 2 worker nodes fail, what is the probability that training completes successfully without failure? (Round to 3 decimal places)",
            "options", Arrays.asList("0.984", "0.886", "0.930", "0.953"),
            "correctIdx", 0,
            "explanation", "We want the probability of 0, 1, or 2 failures among 6 worker nodes.\n" +
                    "Using Binomial Probability P(X = k) = C(6, k) * (0.1)^k * (0.9)^(6-k).\n" +
                    "P(0) = 0.9^6 = 0.5314\n" +
                    "P(1) = 6 * 0.1 * 0.9^5 = 0.3543\n" +
                    "P(2) = 15 * 0.01 * 0.9^4 = 0.0984\n" +
                    "Sum = 0.5314 + 0.3543 + 0.0984 = 0.9841. So, training succeeds with probability 0.984."
        ));

        list.add(Map.of(
            "id", 2,
            "question", "An Amazon CloudFront CDN distributes traffic to an origin server. The latency of cache hit is 5ms, and the latency of cache miss (fetching from origin) is 80ms. If the target average latency for API requests is 20ms, what is the minimum required Cache Hit Ratio (CHR)?",
            "options", Arrays.asList("70%", "75%", "80%", "85%"),
            "correctIdx", 2,
            "explanation", "Average Latency = (CHR * Hit Latency) + ((1 - CHR) * Miss Latency)\n" +
                    "20 = h * 5 + (1 - h) * 80\n" +
                    "20 = 5h + 80 - 80h\n" +
                    "75h = 60 => h = 60 / 75 = 0.8 (80%)."
        ));

        list.add(Map.of(
            "id", 3,
            "question", "A Google Spanner database performs write transactions across three zones using Paxos consensus. If Zone A has a network round-trip time (RTT) of 10ms to Zone B, and 30ms to Zone C, and Zone B has an RTT of 25ms to Zone C, what is the minimum commit latency for a write initiated at Zone B that requires consensus of at least 2 zones?",
            "options", Arrays.asList("10ms", "25ms", "15ms", "30ms"),
            "correctIdx", 0,
            "explanation", "For a 2-zone consensus (majority of 3 zones), Zone B only needs acknowledgement from itself and the closest zone (Zone A).\n" +
                    "The RTT between Zone B and Zone A is 10ms. Therefore, consensus can be reached in 10ms."
        ));

        list.add(Map.of(
            "id", 4,
            "question", "For a TCS digital cloud microservice, a thread pool is configured with a queue capacity of 500 tasks. If tasks arrive at a rate of 120 tasks/sec following a Poisson distribution, and the pool processes tasks at a rate of 150 tasks/sec (Exponential service time), what is the average time a task spends waiting in the queue? (M/M/1 queuing model)",
            "options", Arrays.asList("13.3 ms", "26.7 ms", "8.5 ms", "16.7 ms"),
            "correctIdx", 1,
            "explanation", "Using M/M/1 queue parameters: Arrival rate (lambda) = 120, Service rate (mu) = 150.\n" +
                    "Waiting time in queue Wq = lambda / (mu * (mu - lambda)) = 120 / (150 * (150 - 120)) = 120 / 4500 = 0.0267 seconds = 26.7 ms."
        ));

        return list;
    }
}
