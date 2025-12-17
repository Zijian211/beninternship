import React from "react";
import { Github } from "lucide-react";

export default function GitHubLink() {
  return (
    <a
      href="https://github.com/Zijian211/beninternship" // <--- Update this!
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-5 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-700 hover:scale-105 transition-all"
      title="View Source Code"
    >
      <Github size={20} />
      <span className="text-sm font-bold hidden md:inline">My GitHub</span>
    </a>
  );
}