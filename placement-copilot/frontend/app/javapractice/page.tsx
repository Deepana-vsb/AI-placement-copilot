"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function JavaPractice() {
  const [code, setCode] = useState(`public class Main {
    public static void main(String[] args) {
        // Write your Java implementation here
        System.out.println("Hello, Placement Copilot!");
    }
}`);
  const [consoleOutput, setConsoleOutput] = useState("Run code to see compile & evaluation output...");
  const [running, setRunning] = useState(false);
  const [inputsReceived, setInputsReceived] = useState<string[]>([]);
  const [currentConsoleInput, setCurrentConsoleInput] = useState("");
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);

  // Restore user's previous solution code
  useEffect(() => {
    async function loadLastSubmission() {
      try {
        const res = await fetch("/api/practice/submissions?module=java");
        if (res.ok) {
          const list = await res.json();
          if (list && list.length > 0) {
            setCode(list[0].userCode);
          }
        }
      } catch (err) {
        console.error("Failed to restore last Java solution", err);
      }
    }
    loadLastSubmission();
  }, []);

  const runCodeWithInputs = async (inputsList: string[]) => {
    setRunning(true);
    setConsoleOutput("Compiling & executing code...\n");
    setIsWaitingForInput(false);

    try {
      const response = await fetch("/api/sandbox/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: "java",
          code: code,
          input: inputsList.length > 0 ? inputsList.join("\n") + "\n" : ""
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.stderr && data.stderr.includes("NoSuchElementException")) {
          // Program wanted more input than we provided!
          setIsWaitingForInput(true);
          // Show the prompts printed so far
          setConsoleOutput(data.stdout || "");
        } else {
          // Regular run output (successful or compile/runtime error)
          let outputText = "";
          if (data.stderr) {
            outputText += `Compiler/Runtime Error:\n${data.stderr}\n`;
          }
          if (data.stdout) {
            outputText += `Output:\n${data.stdout}\n`;
          }
          if (!data.stderr && !data.stdout) {
            outputText += "Program executed successfully with no console output.\n";
          }
          outputText += `\nExecution completed with exit code: ${data.code}`;
          setConsoleOutput(outputText);
          setIsWaitingForInput(false);

          // If execution succeeded (exit code 0), call /api/practice/submit to save
          if (data.code === 0) {
            fetch("/api/practice/submit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                module: "java",
                problemId: "Java Expert Sandbox",
                userCode: code,
                status: "completed"
              })
            }).catch(console.error);
          }
        }
      } else {
        throw new Error(data.error || "Sandbox server error");
      }
    } catch (err: any) {
      console.error(err);
      setConsoleOutput(`Compilation or execution failed. Error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleRunCode = () => {
    setInputsReceived([]);
    runCodeWithInputs([]);
  };

  const handleSendConsoleInput = () => {
    const nextInputs = [...inputsReceived, currentConsoleInput];
    setInputsReceived(nextInputs);
    setCurrentConsoleInput("");
    runCodeWithInputs(nextInputs);
  };

  return (
    <Sidebar>
      <div className="mb-lg">
        <div className="flex items-center gap-xs text-outline mb-1">
          <span className="text-xs font-semibold">Practice</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-xs font-semibold text-primary">Java Expert Sandbox</span>
        </div>
        <h2 className="font-bold text-3xl text-primary">Java Practice Lab</h2>
        <p className="text-sm text-on-surface-variant">
          Complete structural Java object challenges and verify output using the live local compiler runtime.
        </p>
      </div>

      {/* Compiler Layout */}
      <div className="max-w-5xl flex flex-col gap-md min-h-[580px]">
        {/* Code Editor Sheet */}
        <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-md bg-[#f2f3ff] border-b border-outline-variant flex items-center justify-between">
            <span className="font-semibold text-xs text-on-surface">workspace_main.java</span>
            <button
              onClick={handleRunCode}
              disabled={running}
              className="px-6 py-2 bg-primary hover:bg-[#1e1b4b] text-white font-bold rounded-lg text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">play_arrow</span>
              {running ? "Compiling..." : "Run Code Console"}
            </button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="w-full flex-1 p-md font-mono text-xs bg-slate-900 text-slate-100 focus:outline-none resize-none min-h-[350px]"
          />
        </div>

        {/* Console Output Sheet */}
        <div className="bg-[#131b2e] border border-outline-variant rounded-xl shadow-sm overflow-hidden p-md">
          <span className="text-[10px] font-bold text-outline block uppercase mb-2">Compiler Output</span>
          
          <pre className="font-mono text-xs text-green-400 leading-relaxed whitespace-pre-wrap">
            {consoleOutput}
          </pre>

          {isWaitingForInput && (
            <div className="flex items-center gap-2 mt-2 font-mono text-xs text-yellow-400 border-t border-slate-800 pt-2">
              <span className="animate-pulse">❯</span>
              <input
                type="text"
                value={currentConsoleInput}
                onChange={(e) => setCurrentConsoleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendConsoleInput();
                  }
                }}
                placeholder="Type scanner input and press Enter..."
                className="bg-transparent border-none outline-none flex-grow text-yellow-400 placeholder-slate-600 font-mono text-xs"
                autoFocus
              />
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
