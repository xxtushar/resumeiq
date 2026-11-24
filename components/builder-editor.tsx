"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ResumeWorkspace, useResumeInsights } from "@/components/builder/workspace";
import type { Update } from "@/components/builder/section-editors";
import type { ResumeDoc } from "@/lib/builder/schema";
import { cn } from "@/lib/utils";

/** In-app builder for a saved draft: saves versions to the account and
 * downloads the PDF from the server. */
export function BuilderEditor({
  resumeId,
  initial,
  title,
}: {
  resumeId: string;
  initial: ResumeDoc;
  title: ReactNode;
}) {
  const [doc, setDoc] = useState<ResumeDoc>(initial);
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(initial));
  const [saving, setSaving] = useState(false);

  const update: Update = useCallback((fn) => setDoc((d) => fn(d)), []);
  const dirty = JSON.stringify(doc) !== savedJson;
  const insights = useResumeInsights(doc);

  const save = useCallback(async (): Promise<boolean> => {
    setSaving(true);
    const snapshot = JSON.stringify(doc);
    try {
      const res = await fetch("/api/builder/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, content: doc }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(body.error ?? "Couldn't save. Try again.");
        return false;
      }
      setSavedJson(snapshot);
      return true;
    } catch {
      toast.error("Network error — your changes are still here. Try saving again.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [doc, resumeId]);

  async function saveWithToast() {
    if (await save()) toast.success("Saved.");
  }

  async function download() {
    if (dirty && !(await save())) return;
    const link = document.createElement("a");
    link.href = `/api/builder/${resumeId}/pdf`;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  // Cmd/Ctrl+S saves; leaving with unsaved changes asks first.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!saving) void save().then((ok) => ok && toast.success("Saved."));
      }
    }
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (dirty) e.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [dirty, save, saving]);

  return (
    <div className="flex flex-col">
      {/* Negative top cancels <main>'s padding, which sticky positioning honours. */}
      <div className="sticky -top-6 z-20 -mx-5 -mt-6 border-b border-line bg-paper/95 px-5 py-3 backdrop-blur-md lg:-top-8 lg:-mx-8 lg:-mt-8 lg:px-8">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="w-full min-w-0 sm:w-auto sm:flex-1">{title}</div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={cn("text-[12.5px]", dirty ? "text-signal" : "text-ink-faint")} aria-live="polite">
              {saving ? "Saving…" : dirty ? "Unsaved changes" : "All changes saved"}
            </span>
            <Button variant="secondary" size="sm" onClick={saveWithToast} disabled={saving || !dirty}>
              Save
            </Button>
            <Button size="sm" onClick={download} disabled={saving}>
              <Download size={15} /> Download PDF
            </Button>
          </div>
        </div>
      </div>

      <ResumeWorkspace
        doc={doc}
        update={update}
        insights={insights}
        previewStickyClass="lg:top-12 lg:max-h-[calc(100vh-9.5rem)]"
        footer={
          <div className="flex items-center gap-3 pb-6">
            <Button onClick={saveWithToast} disabled={saving || !dirty}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <p className="text-[12.5px] text-ink-faint">Tip: ⌘S or Ctrl+S saves from anywhere.</p>
          </div>
        }
      />
    </div>
  );
}
