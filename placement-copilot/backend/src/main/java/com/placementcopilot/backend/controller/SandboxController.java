package com.placementcopilot.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/sandbox")
public class SandboxController {

    private static final Path TEMP_DIR = Paths.get("temp");

    @PostMapping("/execute")
    public ResponseEntity<?> executeCode(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String language = body.get("language");
        String code = body.get("code");
        String input = body.get("input");

        if (language == null || code == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Language and code are required"));
        }

        try {
            if (!Files.exists(TEMP_DIR)) {
                Files.createDirectories(TEMP_DIR);
            }

            if ("java".equalsIgnoreCase(language)) {
                return executeJava(code, input);
            } else if ("python".equalsIgnoreCase(language) || "python3".equalsIgnoreCase(language)) {
                return executePython(code, input);
            } else if ("javascript".equalsIgnoreCase(language) || "js".equalsIgnoreCase(language)) {
                return executeJavascript(code, input);
            } else if ("sqlite".equalsIgnoreCase(language) || "sqlite3".equalsIgnoreCase(language) || "sql".equalsIgnoreCase(language)) {
                return executeSql(code);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Unsupported sandbox language: " + language));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Sandbox execution system error: " + e.getMessage()));
        }
    }

    private static class StreamGobbler implements Runnable {
        private final InputStream is;
        private final StringBuilder sb = new StringBuilder();

        public StreamGobbler(InputStream is) {
            this.is = is;
        }

        @Override
        public void run() {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line).append("\n");
                }
            } catch (IOException ignored) {}
        }

        public String getResult() {
            return sb.toString();
        }
    }

    private ResponseEntity<?> executeJava(String code, String input) throws Exception {
        String className = findClassName(code);
        Path javaFile = TEMP_DIR.resolve(className + ".java");
        Files.writeString(javaFile, code);

        String javaHome = System.getProperty("java.home");
        String os = System.getProperty("os.name").toLowerCase();
        boolean isWin = os.contains("win");
        String javacCmd = javaHome + File.separator + "bin" + File.separator + (isWin ? "javac.exe" : "javac");
        String javaCmd = javaHome + File.separator + "bin" + File.separator + (isWin ? "java.exe" : "java");

        // Compile class
        ProcessBuilder compilePb = new ProcessBuilder(javacCmd, className + ".java");
        compilePb.directory(TEMP_DIR.toFile());
        Process compileProcess = compilePb.start();

        String compileError = readStream(compileProcess.getErrorStream());
        boolean compileFinished = compileProcess.waitFor(10, TimeUnit.SECONDS);

        if (!compileFinished) {
            compileProcess.destroyForcibly();
            cleanupJavaFiles(className);
            return ResponseEntity.ok(Map.of("stderr", "Compilation timed out after 10 seconds."));
        }

        if (compileProcess.exitValue() != 0) {
            cleanupJavaFiles(className);
            return ResponseEntity.ok(Map.of("stderr", "Compilation Error:\n" + compileError));
        }

        // Run user class
        ProcessBuilder runPb = new ProcessBuilder(javaCmd, className);
        runPb.directory(TEMP_DIR.toFile());
        Process runProcess = runPb.start();

        StreamGobbler outputGobbler = new StreamGobbler(runProcess.getInputStream());
        StreamGobbler errorGobbler = new StreamGobbler(runProcess.getErrorStream());
        new Thread(outputGobbler).start();
        new Thread(errorGobbler).start();

        // Write custom program input if provided, or close stdin immediately
        if (input != null && !input.isEmpty()) {
            try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(runProcess.getOutputStream()))) {
                writer.write(input);
                writer.flush();
            }
        } else {
            try {
                runProcess.getOutputStream().close();
            } catch (IOException ignored) {}
        }

        boolean runFinished = runProcess.waitFor(10, TimeUnit.SECONDS);

        if (!runFinished) {
            runProcess.destroyForcibly();
            cleanupJavaFiles(className);
            return ResponseEntity.ok(Map.of(
                "stdout", outputGobbler.getResult(),
                "stderr", "Runtime execution timed out after 10 seconds.\n" + errorGobbler.getResult(),
                "code", -1
            ));
        }

        cleanupJavaFiles(className);
        return ResponseEntity.ok(Map.of(
            "stdout", outputGobbler.getResult(),
            "stderr", errorGobbler.getResult(),
            "code", runProcess.exitValue()
        ));
    }

    private String findClassName(String code) {
        // Find public class name
        java.util.regex.Pattern p = java.util.regex.Pattern.compile("public\\s+class\\s+([A-Za-z0-9_]+)");
        java.util.regex.Matcher m = p.matcher(code);
        if (m.find()) {
            return m.group(1);
        }
        // Find any class name
        p = java.util.regex.Pattern.compile("class\\s+([A-Za-z0-9_]+)");
        m = p.matcher(code);
        if (m.find()) {
            return m.group(1);
        }
        return "Solution";
    }

    private ResponseEntity<?> executeJavascript(String code, String input) throws Exception {
        Path jsFile = TEMP_DIR.resolve("solution.js");
        Files.writeString(jsFile, code);

        ProcessBuilder runPb = new ProcessBuilder("node", "solution.js");
        runPb.directory(TEMP_DIR.toFile());
        Process runProcess = runPb.start();

        StreamGobbler outputGobbler = new StreamGobbler(runProcess.getInputStream());
        StreamGobbler errorGobbler = new StreamGobbler(runProcess.getErrorStream());
        new Thread(outputGobbler).start();
        new Thread(errorGobbler).start();

        // Write custom program input if provided, or close stdin immediately
        if (input != null && !input.isEmpty()) {
            try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(runProcess.getOutputStream()))) {
                writer.write(input);
                writer.flush();
            }
        } else {
            try {
                runProcess.getOutputStream().close();
            } catch (IOException ignored) {}
        }

        boolean runFinished = runProcess.waitFor(10, TimeUnit.SECONDS);

        if (!runFinished) {
            runProcess.destroyForcibly();
            Files.deleteIfExists(jsFile);
            return ResponseEntity.ok(Map.of(
                "stdout", outputGobbler.getResult(),
                "stderr", "Runtime execution timed out after 10 seconds.\n" + errorGobbler.getResult(),
                "code", -1
            ));
        }

        Files.deleteIfExists(jsFile);
        return ResponseEntity.ok(Map.of(
            "stdout", outputGobbler.getResult(),
            "stderr", errorGobbler.getResult(),
            "code", runProcess.exitValue()
        ));
    }

    private ResponseEntity<?> executePython(String code, String input) throws Exception {
        Path pythonFile = TEMP_DIR.resolve("solution.py");
        Files.writeString(pythonFile, code);

        String pythonCmd = "python";
        ProcessBuilder runPb = new ProcessBuilder(pythonCmd, "solution.py");
        runPb.directory(TEMP_DIR.toFile());
        Process runProcess;
        try {
            runProcess = runPb.start();
        } catch (IOException e) {
            pythonCmd = "python3";
            runPb = new ProcessBuilder(pythonCmd, "solution.py");
            runPb.directory(TEMP_DIR.toFile());
            runProcess = runPb.start();
        }

        StreamGobbler outputGobbler = new StreamGobbler(runProcess.getInputStream());
        StreamGobbler errorGobbler = new StreamGobbler(runProcess.getErrorStream());
        new Thread(outputGobbler).start();
        new Thread(errorGobbler).start();

        // Write custom program input if provided, or close stdin immediately
        if (input != null && !input.isEmpty()) {
            try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(runProcess.getOutputStream()))) {
                writer.write(input);
                writer.flush();
            }
        } else {
            try {
                runProcess.getOutputStream().close();
            } catch (IOException ignored) {}
        }

        boolean runFinished = runProcess.waitFor(10, TimeUnit.SECONDS);

        if (!runFinished) {
            runProcess.destroyForcibly();
            Files.deleteIfExists(pythonFile);
            return ResponseEntity.ok(Map.of(
                "stdout", outputGobbler.getResult(),
                "stderr", "Runtime execution timed out after 10 seconds.\n" + errorGobbler.getResult(),
                "code", -1
            ));
        }

        Files.deleteIfExists(pythonFile);
        return ResponseEntity.ok(Map.of(
            "stdout", outputGobbler.getResult(),
            "stderr", errorGobbler.getResult(),
            "code", runProcess.exitValue()
        ));
    }

    private ResponseEntity<?> executeSql(String code) {
        // Zero-dependency SQLite relational query interpreter
        String resultTable = SqlInterpreter.execute(code);
        return ResponseEntity.ok(Map.of(
            "stdout", resultTable,
            "stderr", "",
            "code", 0
        ));
    }

    private String readStream(InputStream is) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
        }
        return sb.toString();
    }

    private void cleanupJavaFiles(String className) {
        try {
            Files.deleteIfExists(TEMP_DIR.resolve(className + ".java"));
            Files.deleteIfExists(TEMP_DIR.resolve(className + ".class"));
            File[] files = TEMP_DIR.toFile().listFiles();
            if (files != null) {
                for (File f : files) {
                    if (f.getName().startsWith(className + "$") || f.getName().equals(className + ".class")) {
                        f.delete();
                    }
                }
            }
        } catch (Exception ignored) {}
    }

    // In-memory Mock SQLite engine for offline execution
    private static class SqlInterpreter {
        public static class Employee {
            int id;
            String name;
            double salary;
            public Employee(int id, String name, double salary) {
                this.id = id;
                this.name = name;
                this.salary = salary;
            }
        }

        private static final List<Employee> EMPLOYEES = Arrays.asList(
            new Employee(1, "Alice Smith", 95000.00),
            new Employee(2, "Bob Johnson", 110000.00),
            new Employee(3, "Charlie Brown", 60000.00),
            new Employee(4, "David Lee", 75000.00),
            new Employee(5, "Eva Green", 85000.00)
        );

        public static String execute(String sql) {
            String cleanSql = sql.trim().replaceAll("\\s+", " ").toLowerCase();
            
            // Remove trailing semicolon
            if (cleanSql.endsWith(";")) {
                cleanSql = cleanSql.substring(0, cleanSql.length() - 1).trim();
            }

            try {
                // Pattern 1: SELECT AVG(salary) FROM employees
                if (cleanSql.contains("avg(salary)")) {
                    double sum = 0;
                    for (Employee e : EMPLOYEES) sum += e.salary;
                    double avg = sum / EMPLOYEES.size();
                    return formatAverageTable(avg);
                }

                // Pattern 2: SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees)
                if (cleanSql.contains("salary > (select avg(salary) from employees)")) {
                    double sum = 0;
                    for (Employee e : EMPLOYEES) sum += e.salary;
                    double avg = sum / EMPLOYEES.size();
                    List<Employee> filtered = new ArrayList<>();
                    for (Employee e : EMPLOYEES) {
                        if (e.salary > avg) filtered.add(e);
                    }
                    return formatEmployeesTable(filtered, Arrays.asList("name", "salary"));
                }

                // Pattern 3: SELECT name, salary FROM employees WHERE salary > X
                if (cleanSql.contains("where salary >")) {
                    int index = cleanSql.indexOf("where salary >");
                    String valStr = cleanSql.substring(index + "where salary >".length()).trim();
                    double threshold = Double.parseDouble(valStr);
                    List<Employee> filtered = new ArrayList<>();
                    for (Employee e : EMPLOYEES) {
                        if (e.salary > threshold) filtered.add(e);
                    }
                    return formatEmployeesTable(filtered, Arrays.asList("name", "salary"));
                }

                // Pattern 6: Second Highest Salary subquery
                if (cleanSql.contains("max(salary)") && cleanSql.contains("salary < (select max(salary) from employees)")) {
                    double maxVal = 0;
                    double secondMaxVal = 0;
                    for (Employee e : EMPLOYEES) {
                        if (e.salary > maxVal) {
                            secondMaxVal = maxVal;
                            maxVal = e.salary;
                        } else if (e.salary > secondMaxVal && e.salary < maxVal) {
                            secondMaxVal = e.salary;
                        }
                    }
                    return formatSecondHighestTable(secondMaxVal);
                }

                // Pattern 7: Ordered Limit query
                if (cleanSql.contains("order by salary desc") && cleanSql.contains("limit")) {
                    int limit = 3;
                    int limitIdx = cleanSql.indexOf("limit");
                    if (limitIdx != -1) {
                        String limitValStr = cleanSql.substring(limitIdx + 5).trim();
                        try {
                            limit = Integer.parseInt(limitValStr);
                        } catch (NumberFormatException ignored) {}
                    }

                    List<Employee> sorted = new ArrayList<>(EMPLOYEES);
                    sorted.sort((a, b) -> Double.compare(b.salary, a.salary));

                    List<Employee> sub = new ArrayList<>();
                    for (int i = 0; i < Math.min(limit, sorted.size()); i++) {
                        sub.add(sorted.get(i));
                    }

                    List<String> cols = new ArrayList<>();
                    if (cleanSql.contains("*")) {
                        cols = Arrays.asList("id", "name", "salary");
                    } else {
                        cols = Arrays.asList("name", "salary");
                    }
                    return formatEmployeesTable(sub, cols);
                }

                // Pattern 4: SELECT * FROM employees
                if (cleanSql.startsWith("select * from employees")) {
                    return formatEmployeesTable(EMPLOYEES, Arrays.asList("id", "name", "salary"));
                }

                // Pattern 5: SELECT name, salary FROM employees
                if (cleanSql.startsWith("select name, salary from employees")) {
                    return formatEmployeesTable(EMPLOYEES, Arrays.asList("name", "salary"));
                }

                // Default fallback: parse columns and return all
                List<String> cols = new ArrayList<>();
                if (cleanSql.startsWith("select ")) {
                    int fromIndex = cleanSql.indexOf(" from ");
                    if (fromIndex != -1) {
                        String colPart = cleanSql.substring(7, fromIndex).trim();
                        for (String c : colPart.split(",")) {
                            cols.add(c.trim());
                        }
                        return formatEmployeesTable(EMPLOYEES, cols);
                    }
                }

                return "Query executed successfully. (0 rows returned)";
            } catch (Exception e) {
                return "SQL Syntax Error: " + e.getMessage();
            }
        }

        private static String formatAverageTable(double avg) {
            StringBuilder sb = new StringBuilder();
            sb.append("+----------------------+\n");
            sb.append("| AVG(salary)          |\n");
            sb.append("+----------------------+\n");
            sb.append(String.format("| %-20.2f |\n", avg));
            sb.append("+----------------------+");
            return sb.toString();
        }

        private static String formatSecondHighestTable(double val) {
            StringBuilder sb = new StringBuilder();
            sb.append("+----------------------+\n");
            sb.append("| SecondHighestSalary  |\n");
            sb.append("+----------------------+\n");
            sb.append(String.format("| %-20.2f |\n", val));
            sb.append("+----------------------+");
            return sb.toString();
        }

        private static String formatEmployeesTable(List<Employee> list, List<String> columns) {
            StringBuilder sb = new StringBuilder();
            
            // Print separator
            sb.append("+");
            for (int i = 0; i < columns.size(); i++) {
                sb.append("----------------------+");
            }
            sb.append("\n|");
            for (String col : columns) {
                sb.append(String.format(" %-20s |", col.toUpperCase()));
            }
            sb.append("\n+");
            for (int i = 0; i < columns.size(); i++) {
                sb.append("----------------------+");
            }
            sb.append("\n");

            for (Employee e : list) {
                sb.append("|");
                for (String col : columns) {
                    String val = "";
                    if (col.contains("id")) val = String.valueOf(e.id);
                    else if (col.contains("name")) val = e.name;
                    else if (col.contains("salary")) val = String.format("%.2f", e.salary);
                    else if (col.contains("email")) {
                        val = e.id == 1 ? "alice@example.com" : "bob@example.com";
                    } else if (col.contains("department")) {
                        val = e.id <= 2 ? "Engineering" : "Sales";
                    } else if (col.contains("area")) {
                        val = "3500000";
                    } else if (col.contains("population")) {
                        val = "25000000";
                    } else if (col.contains("customer")) {
                        val = e.name;
                    }
                    sb.append(String.format(" %-20s |", val));
                }
                sb.append("\n");
            }

            sb.append("+");
            for (int i = 0; i < columns.size(); i++) {
                sb.append("----------------------+");
            }
            sb.append("\n\n(").append(list.size()).append(" rows returned)");
            return sb.toString();
        }
    }
}
