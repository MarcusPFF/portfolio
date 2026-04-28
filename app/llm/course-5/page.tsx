import { ViewTransition } from "react";
import { readFileSync } from "fs";
import path from "path";
import GlassNav from "@/components/GlassNav";
import ChatWidget from "@/components/ChatWidget";
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
    <>
      <GlassNav />

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-purple-300/20 rounded-full blur-3xl float-slow" />
        <div className="absolute top-[60%] right-[10%] w-[350px] h-[350px] bg-pink-300/20 rounded-full blur-3xl float-medium" />
        <div className="absolute top-[30%] right-[30%] w-[300px] h-[300px] bg-blue-300/15 rounded-full blur-3xl float-fast" />
        <div className="absolute bottom-[10%] left-[20%] w-[250px] h-[250px] bg-orange-200/15 rounded-full blur-3xl float-slow" />
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

          <footer className="py-12 text-center text-slate-400 font-light text-sm">
            <p>© 2026 Marcus Forsberg</p>
          </footer>
        </main>
      </ViewTransition>

      <ChatWidget />
    </>
  );
}
