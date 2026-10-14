"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Play,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  GitBranch,
  Layers,
} from "lucide-react";

import {
  State,
  Step,
  detect,
  validate,
  examples,
} from "@/lib/deadlock";

const clone = (s: State): State => ({
  allocation: s.allocation.map(row => [...row]),
  request: s.request.map(row => [...row]),
  available: [...s.available],
  total: [...s.total],
});

const zeros = (n: number, m: number): State => ({
  allocation: Array.from({ length: n }, () => Array(m).fill(0)),
  request: Array.from({ length: n }, () => Array(m).fill(0)),
  available: Array(m).fill(0),
  total: Array(m).fill(0),
});

const blanks = (n: number, m: number): State => ({
  allocation: Array.from({ length: n }, () => Array(m).fill(NaN)),
  request: Array.from({ length: n }, () => Array(m).fill(NaN)),
  available: Array(m).fill(NaN),
  total: Array(m).fill(NaN),
});

const parseInput = (value: string): number => {
  if (value.trim() === "") return NaN;
  if (!/^\d+$/.test(value)) return NaN;
  return Number(value);
};

const displayInput = (value: number): string => {
  return Number.isNaN(value) ? "" : String(value);
};

const vector = (values: number[]) =>
  "[" + values.join(", ") + "]";

function Accordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="border-b border-line py-4 last:border-0">
      <summary className="flex items-center justify-between gap-3 font-semibold">
        {title}
        <ChevronDown
          size={18}
          className="chev transition-transform"
        />
      </summary>

      <div className="pt-4 text-sm leading-7 text-slate-600">
        {children}
      </div>
    </details>
  );
}

export default function Home() {
  const [state, setState] = useState<State>(
    () => clone(examples[0].state)
  );

  const [showResults, setShowResults] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [mode, setMode] = useState<"table" | "graph">("table");

  const [processInput, setProcessInput] = useState(
    String(examples[0].state.allocation.length)
  );

  const [resourceInput, setResourceInput] = useState(
    String(examples[0].state.available.length)
  );

  const n = state.allocation.length;
  const m = state.available.length;

  const error = useMemo(() => {
    const values = [
      ...state.allocation.flat(),
      ...state.request.flat(),
      ...state.available,
      ...state.total,
    ];

    if (
      values.some(
        value =>
          !Number.isFinite(value) ||
          !Number.isInteger(value) ||
          value < 0
      )
    ) {
      return "Please enter valid non-negative whole numbers in all resource fields.";
    }

    return validate(state);
  }, [state]);

  const result = useMemo(
    () => (error ? null : detect(state)),
    [state, error]
  );

  const resize = (nextN: number, nextM: number) => {
    const nn = Math.max(1, Math.min(20, nextN));
    const mm = Math.max(1, Math.min(12, nextM));

    setState(prev => {
      const next = zeros(nn, mm);

      for (let i = 0; i < Math.min(nn, prev.allocation.length); i++) {
        for (let j = 0; j < Math.min(mm, prev.available.length); j++) {
          next.allocation[i][j] = prev.allocation[i][j];
          next.request[i][j] = prev.request[i][j];
        }
      }

      for (let j = 0; j < Math.min(mm, prev.available.length); j++) {
        next.available[j] = prev.available[j];
        next.total[j] = prev.total[j];
      }

      return next;
    });

    setShowResults(false);
    setStepIndex(0);
  };

  const changeProcessCount = (value: string) => {
    if (!/^\d*$/.test(value)) return;

    setProcessInput(value);

    if (value === "") return;

    const count = Number(value);

    if (count >= 1 && count <= 20) {
      resize(count, m);
    }
  };

  const changeResourceCount = (value: string) => {
    if (!/^\d*$/.test(value)) return;

    setResourceInput(value);

    if (value === "") return;

    const count = Number(value);

    if (count >= 1 && count <= 12) {
      resize(n, count);
    }
  };

  const update = (
    key: "allocation" | "request",
    i: number,
    j: number,
    value: string
  ) => {
    if (!/^\d*$/.test(value)) return;

    setState(prev => {
      const next = clone(prev);
      next[key][i][j] = parseInput(value);
      return next;
    });

    setShowResults(false);
    setStepIndex(0);
  };

  const updateVector = (
    key: "available" | "total",
    j: number,
    value: string
  ) => {
    if (!/^\d*$/.test(value)) return;

    setState(prev => {
      const next = clone(prev);
      next[key][j] = parseInput(value);
      return next;
    });

    setShowResults(false);
    setStepIndex(0);
  };

  const clearValues = () => {
    setState(blanks(n, m));
    setShowResults(false);
    setStepIndex(0);
  };

  const loadScenario = (scenario: State) => {
    const next = clone(scenario);

    setState(next);
    setProcessInput(String(next.allocation.length));
    setResourceInput(String(next.available.length));

    setShowResults(false);
    setStepIndex(0);
  };

  const run = () => {
    if (error || !result) return;

    setStepIndex(0);
    setShowResults(true);

    setTimeout(() => {
      document
        .getElementById("results")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  const active: Step | undefined = result?.steps[stepIndex];

  return (
    <main className="min-h-screen">

      {/* HEADER */}

      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">

        <a
          href="#top"
          className="display flex items-center gap-3 text-lg font-bold tracking-tight"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-white">
            <GitBranch size={19} />
          </span>

          deadlock
          <span className="text-moss">.studio</span>
        </a>

        <nav className="hidden gap-7 text-sm font-semibold text-slate-600 sm:flex">
          <a href="#simulator" className="hover:text-ink">
            Simulator
          </a>

          <a href="#learn" className="hover:text-ink">
            Fundamentals
          </a>

          <a href="#workflow" className="hover:text-ink">
            How it works
          </a>
        </nav>

        <div className="hidden text-right text-xs leading-5 text-slate-600 lg:block">
          <span className="block font-bold text-moss">
            OS PROJECT / 2026
          </span>

          <span className="block">
            Rakshat Gupta · 24BCT0222
          </span>

          <span className="block">
            Sara Choudhary · 24BCT0219
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 text-xs text-slate-500 lg:hidden">
        <span className="font-semibold text-moss">
          OS PROJECT / 2026
        </span>

        <span className="ml-2">
          Rakshat Gupta (24BCT0222) · Sara Choudhary (24BCT0219)
        </span>
      </div>

      {/* HERO */}

      <section
        id="top"
        className="mx-auto max-w-6xl px-5 pb-12 pt-14 md:pt-24"
      >
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-moss">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Operating Systems · Deadlock Detection
        </div>

        <h1 className="display max-w-4xl text-5xl font-semibold leading-[1.07] tracking-[-.055em] sm:text-7xl">
          Understand deadlocks.
          <br />
          <span className="text-moss">
            See every decision.
          </span>
        </h1>

        <p className="mt-7 max-w-xl text-base leading-8 text-slate-600">
          Model processes, resources, and outstanding requests.
          Detect deadlocks and trace the operating system&apos;s
          decision process, one step at a time.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <a
            className="btn btn-primary inline-flex items-center gap-2"
            href="#simulator"
          >
            Open simulator
            <ArrowRight size={17} />
          </a>

          <a
            className="btn btn-light inline-flex items-center gap-2"
            href="#workflow"
          >
            See how it works
            <ChevronDown size={17} />
          </a>
        </div>

        <div className="mt-16 grid gap-3 sm:grid-cols-3">

          <div className="panel p-6">
            <Layers className="mb-4 text-moss" />

            <div className="display text-xl font-semibold">
              Build a resource state
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Configure matrices with live validation.
            </p>
          </div>

          <div className="panel p-6">
            <GitBranch className="mb-4 text-moss" />

            <div className="display text-xl font-semibold">
              Run detection
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Find which processes cannot finish.
            </p>
          </div>

          <div className="panel p-6">
            <BookOpen className="mb-4 text-moss" />

            <div className="display text-xl font-semibold">
              Explore the algorithm
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Inspect the underlying logic and execution trace.
            </p>
          </div>

        </div>
      </section>

      {/* SIMULATOR */}

      <section
        id="simulator"
        className="border-y border-line bg-[#eef2eb] py-16"
      >
        <div className="mx-auto max-w-6xl px-5">

          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">

            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-moss">
                THE LAB
              </p>

              <h2 className="display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Deadlock detector
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Start with a sample or enter your own system state.
              </p>
            </div>

            <button
              type="button"
              onClick={clearValues}
              className="btn btn-light inline-flex items-center gap-2"
            >
              <RotateCcw size={15} />
              Clear values
            </button>

          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

            <div className="panel overflow-hidden">

              {/* SYSTEM CONFIGURATION */}

              <div className="border-b border-line p-6">

                <div className="mb-5 flex items-center gap-2 text-sm font-bold">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e6eee4] text-moss">
                    1
                  </span>
                  Configure system
                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  <label className="text-sm font-medium">
                    Number of processes

                    <input
                      className="field mt-2"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={processInput}
                      onChange={e =>
                        changeProcessCount(e.target.value)
                      }
                      onBlur={() =>
                        setProcessInput(String(n))
                      }
                      aria-label="Number of processes"
                    />
                  </label>

                  <label className="text-sm font-medium">
                    Resource types

                    <input
                      className="field mt-2"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={resourceInput}
                      onChange={e =>
                        changeResourceCount(e.target.value)
                      }
                      onBlur={() =>
                        setResourceInput(String(m))
                      }
                      aria-label="Number of resource types"
                    />
                  </label>

                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Supported range: 1–20 processes and 1–12 resource types.
                </p>

              </div>

              {/* RESOURCE INPUTS */}

              <div className="p-6">

                <div className="mb-5 flex items-center gap-2 text-sm font-bold">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e6eee4] text-moss">
                    2
                  </span>
                  Enter resource data
                </div>

                <div className="grid gap-7 xl:grid-cols-2">

                  {(["allocation", "request"] as const).map(key => (

                    <div key={key}>

                      <div className="mb-2 flex items-center justify-between">

                        <h3 className="font-bold capitalize">
                          {key} matrix
                        </h3>

                        <span className="text-xs text-slate-400">
                          {n} × {m}
                        </span>

                      </div>

                      <p className="mb-3 text-xs leading-5 text-slate-500">
                        {key === "allocation"
                          ? "Instances currently held by each process."
                          : "Additional instances each process is currently waiting for."}
                      </p>

                      <div className="overflow-x-auto">

                        <table className="w-full border-separate border-spacing-1 text-center text-xs">

                          <thead>
                            <tr>
                              <th className="p-1" />

                              {state.available.map((_, j) => (
                                <th
                                  key={j}
                                  className="p-1 text-slate-500"
                                >
                                  R{j}
                                </th>
                              ))}
                            </tr>
                          </thead>

                          <tbody>

                            {state[key].map((row, i) => (

                              <tr key={i}>

                                <th className="pr-2 text-slate-500">
                                  P{i}
                                </th>

                                {row.map((value, j) => (

                                  <td key={j}>

                                    <input
                                      aria-label={`${key} P${i} R${j}`}
                                      type="text"
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      value={displayInput(value)}
                                      onChange={e =>
                                        update(
                                          key,
                                          i,
                                          j,
                                          e.target.value
                                        )
                                      }
                                      className="w-14 rounded-lg border border-line bg-paper px-1 py-2 text-center outline-none focus:border-moss"
                                    />

                                  </td>

                                ))}

                              </tr>

                            ))}

                          </tbody>

                        </table>

                      </div>

                    </div>

                  ))}

                </div>

                {/* AVAILABLE AND TOTAL */}

                <div className="mt-7 grid gap-7 xl:grid-cols-2">

                  {(["available", "total"] as const).map(key => (

                    <div key={key}>

                      <h3 className="mb-1 font-bold capitalize">
                        {key} resources
                      </h3>

                      <p className="mb-3 text-xs text-slate-500">
                        {key === "available"
                          ? "Unallocated instances available right now."
                          : "Total instances in the system (allocated + available)."}
                      </p>

                      <div className="flex flex-wrap gap-2">

                        {state[key].map((value, j) => (

                          <label
                            key={j}
                            className="text-center text-xs text-slate-500"
                          >
                            R{j}

                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={displayInput(value)}
                              onChange={e =>
                                updateVector(
                                  key,
                                  j,
                                  e.target.value
                                )
                              }
                              aria-label={`${key} resource R${j}`}
                              className="mt-1 block w-16 rounded-lg border border-line bg-paper px-1 py-2 text-center text-sm text-ink focus:border-moss"
                            />

                          </label>

                        ))}

                      </div>

                    </div>

                  ))}

                </div>

                {/* INPUT EXPLANATION */}

                <details className="mt-7 rounded-xl border border-line bg-paper p-4">

                  <summary className="flex items-center justify-between text-sm font-semibold">
                    See more: what do these inputs mean?
                    <ChevronDown size={16} className="chev" />
                  </summary>

                  <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">

                    <p>
                      <b>Allocation[i][j]</b> is how many instances
                      of resource Rj are held by Pi.
                    </p>

                    <p>
                      <b>Request[i][j]</b> is the outstanding request
                      Pi needs to proceed, not its maximum possible
                      future demand.
                    </p>

                    <p>
                      <b>Available[j]</b> is the number of free
                      resource instances.
                    </p>

                    <p>
                      <b>Total[j]</b> is the total number of instances
                      of that resource.
                    </p>

                    <p>
                      For every resource, Total must equal Available
                      plus all current allocations.
                    </p>

                  </div>

                </details>

                {/* VALIDATION */}

                {error && (

                  <div
                    role="alert"
                    className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
                  >
                               <AlertTriangle
                      className="mr-2 inline"
                      size={16}
                    />
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={run}
                  disabled={!!error}
                  className="btn btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Play size={17} />
                  Run deadlock detection
                </button>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="panel p-5">
                <h3 className="mb-1 font-bold">
                  Load a scenario
                </h3>

                <p className="mb-4 text-xs leading-5 text-slate-500">
                  Compare different resource allocation scenarios.
                </p>

                <div className="space-y-2">
                  {examples.map((example, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => loadScenario(example.state)}
                      className="w-full rounded-xl border border-line p-3 text-left hover:bg-paper"
                    >
                      <span className="block text-sm font-bold">
                        {example.name}{" "}
                        <ArrowRight size={13} className="inline" />
                      </span>

                      <span className="text-xs text-slate-500">
                        {example.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-ink p-6 text-white">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">
                  Resource allocation insight
                </span>

                <h3 className="display mt-4 text-xl font-semibold">
                  A cycle is not always a deadlock.
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/70">
                  For multiple instances of a resource type,
                  use the matrix-based detection algorithm
                  rather than relying on graph cycles alone.
                </p>
              </div>
            </aside>
          </div>

          {showResults && result && (
            <section id="results" className="mt-10 scroll-mt-8">
              <div
                className={`panel p-6 sm:p-8 ${
                  result.deadlocked.length
                    ? "border-rose-200"
                    : "border-emerald-200"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {result.deadlocked.length ? (
                      <AlertTriangle className="mt-1 text-rose-600" />
                    ) : (
                      <ShieldCheck className="mt-1 text-emerald-700" />
                    )}

                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        Detection result
                      </p>

                      <h3 className="display mt-2 text-2xl font-semibold">
                        {result.deadlocked.length
                          ? "Deadlock detected"
                          : "No deadlock detected"}
                      </h3>

                      <p className="mt-2 text-sm text-slate-600">
                        {result.deadlocked.length
                          ? `Deadlocked processes: ${result.deadlocked
                              .map(i => "P" + i)
                              .join(", ")}`
                          : "Every process can complete or holds no resources."}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-paper px-3 py-2 text-xs font-bold">
                    {result.sequence.length} simulated completions
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {result.sequence.map(i => (
                    <span
                      key={i}
                      className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800"
                    >
                      P{i} ✓
                    </span>
                  ))}

                  {result.deadlocked.map(i => (
                    <span
                      key={i}
                      className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800"
                    >
                      P{i} blocked
                    </span>
                  ))}
                </div>

                <details
                  open
                  className="mt-7 border-t border-line pt-6"
                >
                  <summary className="flex items-center justify-between font-bold">
                    See more: full execution trace
                    <ChevronDown size={17} className="chev" />
                  </summary>

                  <div className="mt-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-slate-500">
                        Step {stepIndex + 1} of {result.steps.length}
                      </p>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn btn-light text-sm disabled:opacity-40"
                          disabled={stepIndex === 0}
                          onClick={() => setStepIndex(i => i - 1)}
                        >
                          Previous
                        </button>

                        <button
                          type="button"
                          className="btn btn-primary text-sm disabled:opacity-40"
                          disabled={stepIndex === result.steps.length - 1}
                          onClick={() => setStepIndex(i => i + 1)}
                        >
                          Next step{" "}
                          <ArrowRight size={14} className="inline" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-paper p-5">
                      <p className="font-semibold">
                        {active?.note}
                      </p>

                      <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                        <div>
                          <span className="text-slate-500">
                            Work before
                          </span>
                          <p className="mt-1 font-mono font-bold">
                            {vector(active?.workBefore || [])}
                          </p>
                        </div>

                        <div>
                          <span className="text-slate-500">
                            Work after
                          </span>
                          <p className="mt-1 font-mono font-bold">
                            {vector(active?.workAfter || [])}
                          </p>
                        </div>

                        <div>
                          <span className="text-slate-500">
                            Finish flags
                          </span>
                          <p className="mt-1 font-mono font-bold">
                            {active?.finish
                              .map(value => (value ? "T" : "F"))
                              .join(" · ")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {result.steps.map((step, i) => (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setStepIndex(i)}
                          className={`rounded-lg px-3 py-2 text-xs font-bold ${
                            i === stepIndex
                              ? "bg-ink text-white"
                              : "bg-paper text-slate-500"
                          }`}
                        >
                          {i === 0
                            ? "Start"
                            : i === result.steps.length - 1
                            ? "Verdict"
                            : `P${step.process}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </details>

                <details className="mt-6 border-t border-line pt-6">
                  <summary className="flex items-center justify-between font-bold">
                    See more: resource allocation graph
                    <ChevronDown size={17} className="chev" />
                  </summary>

                  <p className="mt-3 text-sm text-slate-500">
                    Arrows from resources to processes show allocations;
                    arrows from processes to resources show outstanding
                    requests. Edge labels give instance counts.
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMode("graph")}
                      className={`btn text-sm ${
                        mode === "graph" ? "btn-primary" : "btn-light"
                      }`}
                    >
                      Graph
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode("table")}
                      className={`btn text-sm ${
                        mode === "table" ? "btn-primary" : "btn-light"
                      }`}
                    >
                      Edges
                    </button>
                  </div>

                  {mode === "table" ? (
                    <div className="mt-4 max-h-72 overflow-auto rounded-xl bg-paper p-4 text-sm">
                      {state.allocation
                        .flatMap((row, i) =>
                          row.flatMap((value, j) =>
                            value > 0
                              ? [`R${j} → P${i}: ${value} allocated`]
                              : []
                          )
                        )
                        .concat(
                          state.request.flatMap((row, i) =>
                            row.flatMap((value, j) =>
                              value > 0
                                ? [`P${i} → R${j}: ${value} requested`]
                                : []
                            )
                          )
                        )
                        .map((edge, i) => (
                          <div
                            key={i}
                            className="border-b border-line py-2 font-mono last:border-0"
                          >
                            {edge}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="mt-4 overflow-x-auto rounded-xl bg-paper p-3">
                      <svg
                        viewBox={`0 0 720 ${Math.max(
                          290,
                          100 + Math.max(n, m) * 58
                        )}`}
                        className="min-w-[550px]"
                        role="img"
                        aria-label="Resource allocation graph"
                      >
                        <defs>
                          <marker
                            id="arrow"
                            markerWidth="7"
                            markerHeight="7"
                            refX="6"
                            refY="3"
                            orient="auto"
                          >
                            <path
                              d="M0 0 L6 3 L0 6"
                              fill="none"
                              stroke="#64748b"
                              strokeWidth="1.2"
                            />
                          </marker>
                        </defs>

                        {state.allocation.flatMap((row, i) =>
                          row.flatMap((value, j) =>
                            value > 0 ? (
                              <g key={`a${i}-${j}`}>
                                <line
                                  x1="195"
                                  y1={65 + j * 58}
                                  x2="520"
                                  y2={65 + i * 58}
                                  stroke="#5f8570"
                                  strokeWidth="1.5"
                                  markerEnd="url(#arrow)"
                                />
                                <text
                                  x="350"
                                  y={(130 + (i + j) * 58) / 2 - 6}
                                  fill="#476b52"
                                  fontSize="12"
                                >
                                  {value}
                                </text>
                              </g>
                            ) : []
                          )
                        )}

                        {state.request.flatMap((row, i) =>
                          row.flatMap((value, j) =>
                            value > 0 ? (
                              <g key={`r${i}-${j}`}>
                                <line
                                  x1="520"
                                  y1={77 + i * 58}
                                  x2="195"
                                  y2={77 + j * 58}
                                  stroke="#bd7664"
                                  strokeWidth="1.5"
                                  strokeDasharray="5 4"
                                  markerEnd="url(#arrow)"
                                />
                                <text
                                  x="380"
                                  y={(154 + (i + j) * 58) / 2 + 15}
                                  fill="#a45442"
                                  fontSize="12"
                                >
                                  {value}
                                </text>
                              </g>
                            ) : []
                          )
                        )}

                        {state.available.map((_, j) => (
                          <g key={j}>
                            <rect
                              x="125"
                              y={45 + j * 58}
                              width="70"
                              height="36"
                              rx="7"
                              fill="#d9e9dd"
                              stroke="#476b52"
                            />
                            <text
                              x="160"
                              y={68 + j * 58}
                              textAnchor="middle"
                              fontSize="13"
                              fontWeight="bold"
                            >
                              R{j}
                            </text>
                          </g>
                        ))}

                        {state.allocation.map((_, i) => (
                          <g key={i}>
                            <circle
                              cx="555"
                              cy={63 + i * 58}
                              r="22"
                              fill={
                                result.deadlocked.includes(i)
                                  ? "#ffe1e1"
                                  : "#e4ebe5"
                              }
                              stroke={
                                result.deadlocked.includes(i)
                                  ? "#bc5555"
                                  : "#476b52"
                              }
                            />
                            <text
                              x="555"
                              y={68 + i * 58}
                              textAnchor="middle"
                              fontSize="13"
                              fontWeight="bold"
                            >
                              P{i}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                  )}
                </details>

                <details className="mt-6 border-t border-line pt-6">
                  <summary className="flex items-center justify-between font-bold">
                    See more: why this result?
                    <ChevronDown size={17} className="chev" />
                  </summary>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    The detector starts with Work = Available and
                    Finish = true for processes with no allocated
                    resources. It repeatedly finds an unfinished
                    process whose entire outstanding Request row
                    is no greater than Work.

                    That process can complete, release its Allocation
                    row into Work, and become finished.

                    When no further process qualifies, any unfinished
                    processes are deadlocked under the standard
                    deadlock-detection model.

                    A process marked finished initially because it
                    holds no resources is not considered deadlocked,
                    even if its request cannot currently be satisfied.
                  </p>
                </details>
              </div>
            </section>
          )}
        </div>
      </section>

      <section
        id="workflow"
        className="mx-auto max-w-6xl px-5 py-20"
      >
        <p className="text-xs font-bold uppercase tracking-[.2em] text-moss">
          BEHIND THE ALGORITHM
        </p>

        <h2 className="display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          From matrices to a verdict.
        </h2>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {[
            [
              "01",
              "Initialize",
              "Set Work to Available and initialize Finish based on whether each process holds resources.",
            ],
            [
              "02",
              "Find & release",
              "Find a process with Request ≤ Work, then add its Allocation back to Work.",
            ],
            [
              "03",
              "Identify deadlock",
              "Repeat until no more processes qualify. Unfinished processes are deadlocked.",
            ],
          ].map(([id, title, description]) => (
            <div className="panel p-6" key={id}>
              <span className="display text-3xl font-semibold text-moss">
                {id}
              </span>

              <h3 className="mt-5 text-lg font-bold">
                {title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                {description}
              </p>
            </div>
          ))}
        </div>

        <details className="panel mt-5 p-6">
          <summary className="flex items-center justify-between font-bold">
            See more: pseudocode and time complexity
            <ChevronDown className="chev" size={18} />
          </summary>

          <pre className="mt-5 overflow-auto rounded-xl bg-ink p-5 text-xs leading-7 text-white">
{`Work = Available
Finish[i] = (Allocation[i] is all zeros)

repeat:
    find i where not Finish[i] and Request[i] <= Work
    if none exists: break
    Work = Work + Allocation[i]
    Finish[i] = true

Deadlocked = all i with Finish[i] == false`}
          </pre>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            A straightforward implementation scans up to P processes
            per successful completion, checking R resource types
            each time: O(P² × R) time and O(P + R) additional
            algorithmic space, excluding the input matrices
            and stored trace.
          </p>
        </details>
      </section>

      <section
        id="learn"
        className="border-t border-line bg-white py-20"
      >
        <div className="mx-auto max-w-4xl px-5">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-moss">
            DEADLOCK FUNDAMENTALS
          </p>

          <h2 className="display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Deadlock theory and system behavior.
          </h2>

          <p className="mt-4 text-slate-500">
            The principles, conditions, and resource-management
            techniques behind deadlock detection.
          </p>

          <div className="mt-9">
            <Accordion title="What is a deadlock?">
              A deadlock is a situation in which a set of processes
              cannot make progress because each is waiting for
              resources or events that other processes in the set
              must provide.

              For example, P0 holds R0 and requests R1 while P1
              holds R1 and requests R0, with no free instances.
            </Accordion>

            <Accordion title="The four Coffman conditions">
              Mutual exclusion: at least one resource is non-shareable.

              Hold and wait: a process holds resources while
              requesting others.

              No preemption: resources cannot be forcibly reclaimed.

              Circular wait: a closed chain of processes waits
              for resources held by the next.

              All four are necessary for deadlock in the classic
              resource model.
            </Accordion>

            <Accordion title="Detection vs prevention vs avoidance">
              Prevention structurally eliminates at least one
              necessary condition.

              Avoidance uses advance knowledge of maximum claims
              and admits allocations only when the resulting
              state is safe.

              Detection allows allocation to proceed and periodically
              identifies existing deadlocks; recovery then takes action.
            </Accordion>

            <Accordion title="Is this Banker's Algorithm?">
              No.

              Banker&apos;s safety check uses Allocation, Max,
              and Need = Max − Allocation to decide whether
              a state is safe.

              This detector uses Allocation, current outstanding
              Request, and Available to identify processes
              currently deadlocked.

              An unsafe state does not necessarily mean a
              deadlock exists.
            </Accordion>

            <Accordion title="Single-instance and multiple-instance graphs">
              With one instance per resource type, a cycle in the
              resource allocation graph is necessary and sufficient
              for deadlock in the standard model.

              With multiple instances, a cycle alone is not
              sufficient; the matrix algorithm is more informative.

              The graph shown here represents resource types and
              labels counts rather than drawing each instance separately.
            </Accordion>

            <Accordion title="What happens after a deadlock is detected?">
              Possible recovery strategies include terminating
              all deadlocked processes, terminating them one
              at a time until the cycle breaks, or preempting
              resources where safe.

              Practical trade-offs include rollback, priority,
              work already completed, and starvation risk.
            </Accordion>

            <Accordion title="How does the simulation work?">
              The simulation takes P processes and R resource types,
              validates Allocation, Request, Available, and Total
              values, and then runs the detection algorithm.

              The execution trace shows how Work changes as eligible
              processes finish and release resources.

              Any remaining unfinished processes are identified
              as deadlocked.

              Unlike Banker&apos;s algorithm, this method detects
              existing deadlocks rather than evaluating future safety.
            </Accordion>
          </div>
        </div>
      </section>
    </main>
  );
}
