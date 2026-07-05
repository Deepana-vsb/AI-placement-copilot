"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

interface SqlProblem {
  title: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  constraints: string[];
  targetSchema: string;
  defaultQuery: string;
}

const SQL_PROBLEMS: SqlProblem[] = [
  {
    title: "All Employees Details",
    category: "Basic Select",
    difficulty: "Easy",
    description: "Write an SQL query to retrieve all columns and all records from the `employees` table, ordered by salary in ascending order.",
    constraints: [
      "The result table should include all columns: id, name, salary.",
      "Order the output by salary in ascending order."
    ],
    targetSchema: "employees (\n  id INT PRIMARY KEY,\n  name VARCHAR(50),\n  salary DECIMAL(10, 2)\n)",
    defaultQuery: "-- Write your SQL query here\n"
  },
  {
    title: "High Income Earners",
    category: "Basic Filtering",
    difficulty: "Easy",
    description: "Write an SQL query to select the `name` and `salary` of all employees who earn strictly more than `80,000` per year.",
    constraints: [
      "Select only name and salary columns.",
      "The salary threshold must be strictly greater than 80,000."
    ],
    targetSchema: "employees (\n  id INT PRIMARY KEY,\n  name VARCHAR(50),\n  salary DECIMAL(10, 2)\n)",
    defaultQuery: "-- Write your SQL query here\n"
  },
  {
    title: "Employees Earning Above Average",
    category: "Subqueries & Aggregations",
    difficulty: "Medium",
    description: "Write an SQL query selecting the `name` and `salary` of all employees earning higher than the average salary of the entire organization.",
    constraints: [
      "Select only name and salary columns.",
      "Use a subquery to dynamically calculate the organization average."
    ],
    targetSchema: "employees (\n  id INT PRIMARY KEY,\n  name VARCHAR(50),\n  salary DECIMAL(10, 2)\n)",
    defaultQuery: "-- Write your SQL query here\n"
  },
  {
    title: "Second Highest Salary",
    category: "Subqueries & Windowing",
    difficulty: "Medium",
    description: "Write an SQL query to find the second highest salary from the `employees` table. If there is no second highest salary, the query should return NULL.",
    constraints: [
      "Return the second highest salary as a single numeric value.",
      "You can name the column 'SecondHighestSalary' or use the default aggregate label."
    ],
    targetSchema: "employees (\n  id INT PRIMARY KEY,\n  name VARCHAR(50),\n  salary DECIMAL(10, 2)\n)",
    defaultQuery: "-- Write your SQL query here\n"
  },
  {
    title: "Top 3 Highest Paid Employees",
    category: "Sorting & Limiting",
    difficulty: "Hard",
    description: "Write an SQL query to retrieve the `name` and `salary` of the top 3 highest earning employees in the organization, sorted in descending order of salary.",
    constraints: [
      "Select name and salary.",
      "Order the output by salary DESC.",
      "Limit the final result set to exactly 3 rows."
    ],
    targetSchema: "employees (\n  id INT PRIMARY KEY,\n  name VARCHAR(50),\n  salary DECIMAL(10, 2)\n)",
    defaultQuery: "-- Write your SQL query here\n"
  },
  {
    title: "Duplicate Emails",
    category: "Data Cleansing",
    difficulty: "Easy",
    description: "Write an SQL query to find all duplicate emails in the `users` table.",
    constraints: [
      "Find emails that appear more than once.",
      "Return email list."
    ],
    targetSchema: "users (\n  id INT PRIMARY KEY,\n  email VARCHAR(100)\n)",
    defaultQuery: "-- Write your SQL query here\n"
  },
  {
    title: "Department Highest Salary",
    category: "Joins & Aggregations",
    difficulty: "Medium",
    description: "Write an SQL query to find employees who have the highest salary in each department.",
    constraints: [
      "Retrieve department name, employee name, and salary.",
      "Filter by maximum salary group."
    ],
    targetSchema: "employees (\n  id INT PRIMARY KEY,\n  name VARCHAR(50),\n  salary DECIMAL(10, 2),\n  department_id INT\n)\ndepartments (\n  id INT PRIMARY KEY,\n  name VARCHAR(50)\n)",
    defaultQuery: "-- Write your SQL query here\n"
  },
  {
    title: "Customers Who Never Order",
    category: "Basic Joins",
    difficulty: "Easy",
    description: "Write an SQL query to find all customers who never ordered anything.",
    constraints: [
      "Return customer names.",
      "Match keys in customers and orders tables."
    ],
    targetSchema: "customers (\n  id INT PRIMARY KEY,\n  name VARCHAR(50)\n)\norders (\n  id INT PRIMARY KEY,\n  customer_id INT\n)",
    defaultQuery: "-- Write your SQL query here\n"
  },
  {
    title: "Big Countries",
    category: "Basic Select",
    difficulty: "Easy",
    description: "Write an SQL query to find the name, population, and area of big countries (area > 3,000,000 or population > 25,000,000).",
    constraints: [
      "Select name, population, and area.",
      "Filter based on area or population thresholds."
    ],
    targetSchema: "world (\n  name VARCHAR(50) PRIMARY KEY,\n  continent VARCHAR(50),\n  area INT,\n  population INT,\n  gdp BIGINT\n)",
    defaultQuery: "-- Write your SQL query here\n"
  },
  {
    title: "Rank Scores",
    category: "Windowing Functions",
    difficulty: "Medium",
    description: "Write an SQL query to rank scores in descending order. If there is a tie between two scores, both should have the same ranking.",
    constraints: [
      "Scores should be ranked dynamically.",
      "Ties must receive consecutive ranks."
    ],
    targetSchema: "scores (\n  id INT PRIMARY KEY,\n  score DECIMAL(5, 2)\n)",
    defaultQuery: "-- Write your SQL query here\n"
  }
];

export default function SqlPractice() {
  const [selectedProb, setSelectedProb] = useState<SqlProblem | null>(null);
  const [query, setQuery] = useState("");
  const [consoleOutput, setConsoleOutput] = useState("Select a query challenge from the dashboard to start practicing.");
  const [running, setRunning] = useState(false);

  // Restore user's previous solution query for this problem
  useEffect(() => {
    if (!selectedProb) return;
    async function loadLastSubmission() {
      try {
        const res = await fetch(`/api/practice/submissions?module=sql&problemId=${encodeURIComponent(selectedProb.title)}`);
        if (res.ok) {
          const list = await res.json();
          if (list && list.length > 0) {
            setQuery(list[0].userCode);
          }
        }
      } catch (err) {
        console.error("Failed to restore last SQL query", err);
      }
    }
    loadLastSubmission();
  }, [selectedProb]);

  const startProblem = (prob: SqlProblem) => {
    setSelectedProb(prob);
    setQuery(prob.defaultQuery);
    setConsoleOutput("Write your SQL query in the console and click Execute SQL Query...");
  };

  const handleRunQuery = async () => {
    if (!selectedProb) return;
    setRunning(true);
    setConsoleOutput("Initializing local in-memory relational database...\nExecuting query...\n");

    try {
      const response = await fetch("/api/sandbox/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: "sqlite",
          code: query
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.stderr) {
          setConsoleOutput(`SQLite Engine Error:\n${data.stderr}`);
        } else {
          setConsoleOutput(data.stdout || "Query executed successfully. No rows returned.");

          // If query compiled/executed with no error, call submit API to save progress
          fetch("/api/practice/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              module: "sql",
              problemId: selectedProb.title,
              userCode: query,
              status: "completed"
            })
          }).catch(console.error);
        }
      } else {
        throw new Error(data.error || "Sandbox server error");
      }
    } catch (err: any) {
      console.error(err);
      setConsoleOutput(`Failed to connect to execution server. Error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <Sidebar>
      <div className="mb-lg">
        <div className="flex items-center gap-xs text-outline mb-1">
          <span className="text-xs font-semibold">Practice</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-xs font-semibold text-primary">SQL Relational Sandbox</span>
        </div>
        <h2 className="font-bold text-3xl text-primary">SQL Practice Lab</h2>
        <p className="text-sm text-on-surface-variant">
          Solve relative database access queries using the interactive SQL relational console.
        </p>
      </div>

      {!selectedProb ? (
        /* SQL Problem Dashboard List */
        <div className="bg-white border border-outline-variant rounded-2xl shadow-sm p-lg space-y-md">
          <h3 className="font-bold text-lg text-primary mb-md">Relational Query Challenges</h3>
          <div className="divide-y divide-gray-100">
            {SQL_PROBLEMS.map((prob) => {
              return (
                <div
                  key={prob.title}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-md first:pt-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-[#1E1B6A] hover:text-indigo-600 cursor-pointer" onClick={() => startProblem(prob)}>
                        {prob.title}
                      </h4>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] font-bold rounded uppercase">
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
                    <p className="text-xs text-gray-500 line-clamp-2 max-w-2xl leading-relaxed">
                      {prob.description}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => startProblem(prob)}
                      className="px-4 py-2 border border-primary hover:bg-primary/5 text-primary text-xs font-bold rounded-xl transition-all"
                    >
                      Solve Challenge
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* SQL Compiler Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-stretch min-h-[580px]">
          {/* Left Card: SQL Problem Details */}
          <div className="lg:col-span-5 bg-white border border-outline-variant rounded-xl shadow-sm p-lg flex flex-col justify-between">
            <div className="space-y-md">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedProb(null)}
                  className="text-xs text-outline hover:text-primary transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Back to Challenges
                </button>
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
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {selectedProb.description}
              </p>

              <div className="p-sm bg-[#faf8ff] rounded-xl border border-outline-variant space-y-1">
                <span className="text-[10px] font-bold text-outline block">TARGET SCHEMAS (Auto-loaded)</span>
                <pre className="text-[10px] text-indigo-950 font-mono whitespace-pre-wrap leading-relaxed">
                  {selectedProb.targetSchema}
                </pre>
              </div>

              <div className="p-sm bg-[#faf8ff] rounded-xl border border-outline-variant space-y-1">
                <span className="text-[10px] font-bold text-outline block">CONSTRAINTS</span>
                <ul className="list-disc pl-4 text-[10px] text-on-surface-variant space-y-1">
                  {selectedProb.constraints.map((c, i) => (
                    <li key={i} className="font-sans">{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={handleRunQuery}
                disabled={running}
                className="w-full py-3 bg-primary hover:bg-[#1e1b4b] text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">database</span>
                {running ? "Executing..." : "Execute SQL Query"}
              </button>
            </div>
          </div>

          {/* Right Card: Editor and Relational Output */}
          <div className="lg:col-span-7 flex flex-col gap-md">
            {/* SQL Editor */}
            <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
              <div className="p-md bg-[#f2f3ff] border-b border-outline-variant flex items-center justify-between">
                <span className="font-semibold text-xs text-on-surface">query.sql</span>
              </div>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                spellCheck={false}
                className="w-full flex-1 p-md font-mono text-xs bg-slate-900 text-slate-100 focus:outline-none resize-none min-h-[250px]"
              />
            </div>

            {/* Relational Output Console */}
            <div className="bg-[#131b2e] border border-outline-variant rounded-xl shadow-sm overflow-hidden p-md">
              <span className="text-[10px] font-bold text-outline block uppercase mb-2">Relational Output</span>
              <pre className="font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto whitespace-pre">
                {consoleOutput}
              </pre>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
