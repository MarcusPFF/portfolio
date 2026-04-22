"use client";

import { useEffect, useState } from "react";

const ROLES = ["Developer", "Quality Assurance (QA)", "Guide", "Adventurer"];
const TYPE_MS = 80;
const DELETE_MS = 45;
const HOLD_MS = 1600;

export default function TypewriterRoles() {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ms);
      });

    const run = async () => {
      let index = 0;
      while (!cancelled) {
        const current = ROLES[index];
        for (let i = 1; i <= current.length; i += 1) {
          if (cancelled) return;
          setDisplay(current.slice(0, i));
          await sleep(TYPE_MS);
        }
        await sleep(HOLD_MS);
        for (let i = current.length - 1; i >= 0; i -= 1) {
          if (cancelled) return;
          setDisplay(current.slice(0, i));
          await sleep(DELETE_MS);
        }
        index = (index + 1) % ROLES.length;
      }
    };

    run();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <span className="inline-flex items-baseline">
      <span className="text-slate-600">{display}</span>
      <span
        className="ml-0.5 w-[2px] h-[0.9em] bg-slate-500 inline-block animate-pulse"
        aria-hidden="true"
      />
    </span>
  );
}
