"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** The resume as an applicant tracking system reads it: plain text, top to
 * bottom. Same dark mono panel as the landing page's "robot" illustration. */
export function RobotView({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative bg-shell shadow-[0_24px_48px_-24px_rgba(16,35,63,0.55)]">
        <div className="flex items-center justify-between border-b border-shell-line px-5 py-2.5">
          <p className="text-[12.5px] text-shell-muted">Extracted text, in the order a parser reads it</p>
          <button
            type="button"
            onClick={copy}
            disabled={!text}
            className="flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-[12.5px] font-medium text-shell-foreground hover:bg-shell-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-soft disabled:opacity-40"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy text"}
          </button>
        </div>
        <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-[12px] leading-[1.85] text-shell-muted">
          {text ? (
            text.split("\n").map((line, i) => (
              <span
                key={i}
                className={
                  i === 0 || /^[A-Z][A-Z ]+$/.test(line) ? "block text-shell-foreground" : "block"
                }
              >
                {line || " "}
              </span>
            ))
          ) : (
            <span className="text-shell-muted/70">[ nothing to read yet ]</span>
          )}
        </pre>
      </div>
      <p className="text-[12.5px] leading-relaxed text-ink-muted">
        If something is missing or out of order here, it&apos;s missing for the recruiter&apos;s
        software too. Use “Copy text” for job portals that ask you to paste your resume.
      </p>
    </div>
  );
}
