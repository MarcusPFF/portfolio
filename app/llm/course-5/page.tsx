import { ViewTransition } from "react";
import { readFileSync } from "fs";
import path from "path";
import GlassNav from "@/components/GlassNav";
import ChatWidgetLazy from "@/components/ChatWidgetLazy";
import Course5Assessor from "@/components/Course5Assessor";

const dataDir = path.join(process.cwd(), "app/llm/course-5/data");
const exampleSubmissions = {
  "1": readFileSync(path.join(dataDir, "student1.md"), "utf-8"),
  "2": readFileSync(path.join(dataDir, "student2.md"), "utf-8"),
  "3": readFileSync(path.join(dataDir, "student3.md"), "utf-8"),
} as const;

export const metadata = {
  title: "Course 5 + 6 · AI Assignment Assessor | Marcus Forsberg",
  description:
    "Server-side GROQ integration that grades student assignments against a fixed rubric and returns a structured JSON assessment.",
};

export default function Course5Page() {
  return (
    <div className="theme-night">
      <GlassNav night />

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute top-[10%] -left-[6%] w-[520px] h-[520px] rounded-full blur-3xl float-slow"
          style={{ background: 'oklch(48% 0.008 280 / 0.22)' }}
        />
        <div
          className="absolute bottom-[4%] -right-[6%] w-[460px] h-[460px] rounded-full blur-3xl float-medium"
          style={{ background: 'oklch(42% 0.12 280 / 0.16)' }}
        />
      </div>

      <ViewTransition
        enter={{
          "nav-forward": "nav-forward",
          "nav-back": "nav-back",
          default: "none",
        }}
        exit={{
          "nav-forward": "nav-forward",
          "nav-back": "nav-back",
          default: "none",
        }}
        default="none"
      >
        <main className="relative z-10 pt-20">
          <Course5Assessor exampleSubmissions={exampleSubmissions} />

          <footer className="py-12 text-center font-mono text-[11px] text-[color:var(--bone-mute)]">
            <p>© {new Date().getFullYear()} Marcus Forsberg</p>
          </footer>
        </main>
      </ViewTransition>

      <ChatWidgetLazy />
    </div>
  );
}
