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
           
