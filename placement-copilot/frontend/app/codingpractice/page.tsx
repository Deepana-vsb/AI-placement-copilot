"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

interface CodingProblem {
  title: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Completed" | "In Progress" | "Todo";
  xpAward: number;
  description: string;
  constraints: string[];
  templates: {
    python: string;
    javascript: string;
    java: string;
  };
}

const PROBLEMS: CodingProblem[] = [
  {
    title: "Two Sum",
    category: "Arrays & Hashes",
    difficulty: "Easy",
    status: "Completed",
    xpAward: 50,
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"],
    templates: {
      python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your code here\n        print("Input nums:", nums, "Target:", target)\n        for i in range(len(nums)):\n            for j in range(i + 1, len(nums)):\n                if nums[i] + nums[j] == target:\n                    return [i, j]\n        return []\n\nprint(Solution().twoSum([2, 7, 11, 15], 9))`,
      javascript: `function twoSum(nums, target) {\n    console.log("Input nums:", nums, "Target:", target);\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) return [map.get(diff), i];\n        map.set(nums[i], i);\n    }\n    return [];\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9));`,
      java: `public class Solution {\n    public static void main(String[] args) {\n        int[] result = new Solution().twoSum(new int[]{2, 7, 11, 15}, 9);\n        System.out.println("Result: [" + result[0] + ", " + result[1] + "]");\n    }\n\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        for (int i = 0; i < nums.length; i++) {\n            for (int j = i + 1; j < nums.length; j++) {\n                if (nums[i] + nums[j] == target) {\n                    return new int[]{i, j};\n                }\n            }\n        }\n        return new int[0];\n    }\n}`
    }
  },
  {
    title: "Longest Common Subsequence",
    category: "Dynamic Programming",
    difficulty: "Hard",
    status: "Completed",
    xpAward: 150,
    description: "Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return 0.",
    constraints: ["1 <= text1.length, text2.length <= 1000", "text1 and text2 consist of only lowercase English characters."],
    templates: {
      python: `class Solution:\n    def longestCommonSubsequence(self, text1: str, text2: str) -> int:\n        # Write your code here\n        dp = [[0] * (len(text2) + 1) for _ in range(len(text1) + 1)]\n        for i in range(len(text1) - 1, -1, -1):\n            for j in range(len(text2) - 1, -1, -1):\n                if text1[i] == text2[j]:\n                    dp[i][j] = 1 + dp[i+1][j+1]\n                else:\n                    dp[i][j] = max(dp[i+1][j], dp[i][j+1])\n        return dp[0][0]\n\nprint(Solution().longestCommonSubsequence("abcde", "ace"))`,
      javascript: `function longestCommonSubsequence(text1, text2) {\n    // Write your code here\n    return 0;\n}\nconsole.log(longestCommonSubsequence("abcde", "ace"));`,
      java: `public class Solution {\n    public static void main(String[] args) {\n        System.out.println(new Solution().longestCommonSubsequence("abcde", "ace"));\n    }\n    public int longestCommonSubsequence(String text1, String text2) {\n        // Write your code here\n        return 0;\n    }\n}`
    }
  },
  {
    title: "Validate Binary Search Tree",
    category: "Trees & BST",
    difficulty: "Medium",
    status: "In Progress",
    xpAward: 100,
    description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
    constraints: ["The number of nodes in the tree is in the range [1, 10^4].", "-2^31 <= Node.val <= 2^31 - 1"],
    templates: {
      python: `# Definition for a binary tree node.\n# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\nclass Solution:\n    def isValidBST(self, root) -> bool:\n        return True\nprint("Result:", Solution().isValidBST(None))`,
      javascript: `function isValidBST(root) {\n    return true;\n}\nconsole.log("Result:", isValidBST(null));`,
      java: `public class Solution {\n    public static void main(String[] args) {\n        System.out.println("Result: " + new Solution().isValidBST());\n    }\n    public boolean isValidBST() {\n        return true;\n    }\n}`
    }
  },
  {
    title: "Group Anagrams",
    category: "Arrays & Hashes",
    difficulty: "Medium",
    status: "Todo",
    xpAward: 100,
    description: "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.",
    constraints: ["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100", "strs[i] consists of lowercase English letters."],
    templates: {
      python: `class Solution:\n    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:\n        return [strs]\nprint(Solution().groupAnagrams(["eat","tea","tan","ate","nat","bat"]))`,
      javascript: `function groupAnagrams(strs) {\n    return [strs];\n}\nconsole.log(groupAnagrams(["eat","tea","tan","ate","nat","bat"]));`,
      java: `import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        System.out.println(new Solution().groupAnagrams(new String[]{"eat","tea"}));\n    }\n    public List<List<String>> groupAnagrams(String[] strs) {\n        return new ArrayList<>();\n    }\n}`
    }
  },
  {
    title: "Valid Palindrome",
    category: "Two Pointers",
    difficulty: "Easy",
    status: "Todo",
    xpAward: 50,
    description: "Given a string `s`, return \`true\` if it is a palindrome, or \`false\` otherwise.",
    constraints: ["1 <= s.length <= 2 * 10^5", "s consists only of printable ASCII characters."],
    templates: {
      python: `class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        clean = "".join(c.lower() for c in s if c.isalnum())\n        return clean == clean[::-1]\nprint(Solution().isPalindrome("A man, a plan, a canal: Panama"))`,
      javascript: `function isPalindrome(s) {\n    const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");\n    return clean === clean.split("").reverse().join("");\n}\nconsole.log(isPalindrome("A man, a plan, a canal: Panama"));`,
      java: `public class Solution {\n    public static void main(String[] args) {\n        System.out.println(new Solution().isPalindrome("race a car"));\n    }\n    public boolean isPalindrome(String s) {\n        return false;\n    }\n}`
    }
  },
  {
    title: "Binary Search",
    category: "Binary Search",
    difficulty: "Easy",
    status: "Todo",
    xpAward: 50,
    description: "Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.",
    constraints: ["1 <= nums.length <= 10^4", "-10^4 < nums[i], target < 10^4", "All the integers in nums are unique.", "nums is sorted in ascending order."],
    templates: {
      python: `class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        return -1\nprint(Solution().search([-1,0,3,5,9,12], 9))`,
      javascript: `function search(nums, target) {\n    return -1;\n}\nconsole.log(search([-1,0,3,5,9,12], 9));`,
      java: `public class Solution {\n    public static void main(String[] args) {\n        System.out.println(new Solution().search(new int[]{-1,0,3,5,9,12}, 9));\n    }\n    public int search(int[] nums, int target) {\n        return -1;\n    }\n}`
    }
  },
  {
    title: "Merge Intervals",
    category: "Intervals",
    difficulty: "Medium",
    status: "Todo",
    xpAward: 100,
    description: "Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    constraints: ["1 <= intervals.length <= 10^4", "intervals[i].length == 2", "0 <= start_i <= end_i <= 10^4"],
    templates: {
      python: `class Solution:\n    def merge(self, intervals: list[list[int]]) -> list[list[int]]:\n        return intervals\nprint(Solution().merge([[1,3],[2,6],[8,10],[15,18]]))`,
      javascript: `function merge(intervals) {\n    return intervals;\n}\nconsole.log(merge([[1,3],[2,6],[8,10],[15,18]]));`,
      java: `import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        System.out.println(Arrays.deepToString(new Solution().merge(new int[][]{{1,3},{2,6}})));\n    }\n    public int[][] merge(int[][] intervals) {\n        return intervals;\n    }\n}`
    }
  },
  {
    title: "Longest Common Subsequence",
    category: "Dynamic Programming",
    difficulty: "Hard",
    status: "Todo",
    xpAward: 150,
    description: "Given two strings \`text1\` and \`text2\`, return the length of their longest common subsequence. If there is no common subsequence, return \`0\`.",
    constraints: ["1 <= text1.length, text2.length <= 1000", "text1 and text2 consist of only lowercase English characters."],
    templates: {
      python: `class Solution:\n    def longestCommonSubsequence(self, text1: str, text2: str) -> int:\n        return 0\nprint(Solution().longestCommonSubsequence("abcde", "ace"))`,
      javascript: `function longestCommonSubsequence(text1, text2) {\n    return 0;\n}\nconsole.log(longestCommonSubsequence("abcde", "ace"));`,
      java: `public class Solution {\n    public static void main(String[] args) {\n        System.out.println(new Solution().longestCommonSubsequence("abcde", "ace"));\n    }\n    public int longestCommonSubsequence(String text1, String text2) {\n        return 0;\n    }\n}`
    }
  }
];

export default function CodingPractice() {
  const [selectedProb, setSelectedProb] = useState<CodingProblem | null>(null);
  const [language, setLanguage] = useState<"python" | "javascript" | "java">("python");
  const [code, setCode] = useState("");
  const [consoleOutput, setConsoleOutput] = useState("Click Run to execute test code...");
  const [running, setRunning] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [showInput, setShowInput] = useState(false);

  // Restore user's previous solution for this challenge
  useEffect(() => {
    if (!selectedProb) return;
    async function loadLastSubmission() {
      try {
        const res = await fetch(`/api/practice/submissions?module=coding&problemId=${encodeURIComponent(selectedProb.title + "-" + language)}`);
        if (res.ok) {
          const list = await res.json();
          if (list && list.length > 0) {
            setCode(list[0].userCode);
          } else {
            setCode(selectedProb.templates[language]);
          }
        }
      } catch (err) {
        console.error("Failed to restore last coding solution", err);
      }
    }
    loadLastSubmission();
  }, [selectedProb, language]);

  const selectProblem = (prob: CodingProblem) => {
    setSelectedProb(prob);
    setLanguage("python");
    setCode(prob.templates.python);
    setConsoleOutput("Click Run to execute test code...");
  };

  const handleLanguageChange = (lang: "python" | "javascript" | "java") => {
    if (!selectedProb) return;
    setLanguage(lang);
    setCode(selectedProb.templates[lang]);
  };

  const handleRunCode = async () => {
    if (!selectedProb) return;
    setRunning(true);
    setConsoleOutput("Compiling & Executing code...\n");

    const pistonLangs = {
      python: { language: "python", version: "3.10.0", file: "solution.py" },
      javascript: { language: "javascript", version: "18.15.0", file: "solution.js" },
      java: { language: "java", version: "15.0.2", file: "Solution.java" }
    };

    const config = pistonLangs[language];

    try {
      const response = await fetch("/api/sandbox/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: language,
          code: code,
          input: userInput
        })
      });

      const data = await response.json();

      if (response.ok) {
        let outputText = "";
        if (data.stderr) {
          outputText += `Runtime Error:\n${data.stderr}\n`;
        }
        if (data.stdout) {
          outputText += `Console Output:\n${data.stdout}\n`;
        }
        if (!data.stderr && !data.stdout) {
          outputText += "Code executed successfully with no console output.\n";
        }
        outputText += `\nExit Code: ${data.code}`;
        setConsoleOutput(outputText);

        // If execution succeeded (exit code 0) and no runtime error, call submit API
        if (data.code === 0 && !data.stderr) {
          fetch("/api/practice/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              module: "coding",
              problemId: selectedProb.title + "-" + language,
              userCode: code,
              status: "completed"
            })
          }).catch(console.error);
        }
      } else {
        throw new Error(data.error || "Sandbox server error");
      }
    } catch (err: any) {
      console.error(err);
      setConsoleOutput(`Execution failed: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <Sidebar>
      <div className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h2 className="font-bold text-3xl text-primary">Coding Practice Lab</h2>
          <p className="text-sm text-on-surface-variant">
            Master Data Structures &amp; Algorithms by solving curated corporate interview questions.
          </p>
        </div>
        <div className="flex gap-2">
          {selectedProb && (
            <button
              onClick={() => setSelectedProb(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Challenges
            </button>
          )}
          <Link
            href="/javapractice"
            className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-bold text-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">coffee</span>
            Java Sandbox
          </Link>
          <Link
            href="/sqlpractice"
            className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-bold text-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">database</span>
            SQL Sandbox
          </Link>
        </div>
      </div>

      {!selectedProb ? (
        /* Problems List Card */
        <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="p-md bg-[#f2f3ff] border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-bold text-base text-primary">DS &amp; Algorithms Challenges</h3>
            <span className="text-xs text-on-surface-variant font-medium">{PROBLEMS.length} Problems listed</span>
          </div>

          <div className="divide-y divide-[#eaedff]">
            {PROBLEMS.map((prob, idx) => {
              const isCompleted = prob.status === "Completed";
              const isInProgress = prob.status === "In Progress";

              return (
                <div
                  key={idx}
                  className="p-md hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-md transition-colors"
                >
                  <div className="space-y-1">
                    <h4
                      onClick={() => selectProblem(prob)}
                      className="font-bold text-sm text-primary hover:text-indigo-600 cursor-pointer transition-colors flex items-center gap-2"
                    >
                      {prob.title}
                      <span className="material-symbols-outlined text-xs">launch</span>
                    </h4>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#f2f3ff] text-on-surface-variant text-[10px] font-semibold rounded">
                        {prob.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                          prob.difficulty === "Easy"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : prob.difficulty === "Medium"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {prob.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-lg">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs text-secondary font-bold">+{prob.xpAward} XP</span>
                      <p className="text-[10px] text-outline uppercase font-bold">Award</p>
                    </div>
                    <span
                      onClick={() => selectProblem(prob)}
                      className={`px-3 py-1.5 rounded-full font-bold text-xs cursor-pointer hover:scale-105 transition-transform ${
                        isCompleted
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : isInProgress
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-on-surface-variant border border-outline-variant"
                      }`}
                    >
                      {prob.status === "Todo" ? "Start Challenge" : prob.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Compiler Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-stretch min-h-[580px]">
          {/* Left Card: Problem Info */}
          <div className="lg:col-span-5 bg-white border border-outline-variant rounded-xl shadow-sm p-lg flex flex-col justify-between">
            <div className="space-y-md">
              <div className="flex gap-2">
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold rounded uppercase">
                  {selectedProb.category}
                </span>
                <span
                  className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                    selectedProb.difficulty === "Easy"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : selectedProb.difficulty === "Medium"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {selectedProb.difficulty}
                </span>
              </div>
              <h3 className="font-bold text-xl text-primary">{selectedProb.title}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                {selectedProb.description}
              </p>
              
              <div className="p-sm bg-[#faf8ff] rounded-xl border border-outline-variant space-y-1">
                <span className="text-[10px] font-bold text-outline block">CONSTRAINTS</span>
                <ul className="list-disc pl-4 text-xs text-on-surface-variant space-y-1">
                  {selectedProb.constraints.map((c, i) => (
                    <li key={i} className="font-mono">{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={handleRunCode}
                disabled={running}
                className="w-full py-3 bg-primary hover:bg-[#1e1b4b] text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                {running ? "Executing Code..." : "Run Test Cases"}
              </button>
            </div>
          </div>

          {/* Right Card: Editor and Output */}
          <div className="lg:col-span-7 flex flex-col gap-md">
            {/* Editor Container */}
            <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
              <div className="p-md bg-[#f2f3ff] border-b border-outline-variant flex items-center justify-between">
                <span className="font-semibold text-xs text-on-surface">solution_workspace</span>
                {/* Language Select & Toggle */}
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setShowInput(!showInput)}
                    className={`px-3 py-1 rounded text-[10px] font-bold border transition-all ${
                      showInput
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {showInput ? "Hide Input" : "Custom Input"}
                  </button>
                  {(["python", "javascript", "java"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`px-3 py-1 rounded text-[10px] font-bold border transition-all uppercase ${
                        language === lang
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full flex-1 p-md font-mono text-xs bg-slate-900 text-slate-100 focus:outline-none resize-none min-h-[350px]"
              />
              {showInput && (
                <div className="p-md bg-[#faf8ff] border-t border-outline-variant space-y-xs">
                  <span className="text-[10px] font-bold text-outline block uppercase">Custom Inputs (one per line)</span>
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Enter custom program inputs..."
                    className="w-full h-20 p-2 font-mono text-xs border border-outline-variant rounded-lg focus:outline-none bg-white text-slate-800"
                  />
                </div>
              )}
            </div>

            {/* Console Output Sheet */}
            <div className="bg-[#131b2e] border border-outline-variant rounded-xl shadow-sm overflow-hidden p-md">
              <span className="text-[10px] font-bold text-outline block uppercase mb-2">Compiler Output</span>
              <pre className="font-mono text-xs text-green-400 leading-relaxed whitespace-pre-wrap">
                {consoleOutput}
              </pre>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
