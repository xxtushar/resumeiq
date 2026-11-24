"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { AiDraftingContext } from "@/components/builder/ai-notes";
import { ResumeWorkspace, useResumeInsights } from "@/components/builder/workspace";
import type { Update } from "@/components/builder/section-editors";
import { saveGuestDraft } from "@/app/(app)/builder/actions";
import { pdfFileName } from "@/lib/builder/format";
import { resumeDocSchema, type ResumeDoc } from "@/lib/builder/schema";

const STORAGE_KEY = "resumeiq:resume-builder-draft";

function loadLocalDraft(): ResumeDoc | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = resumeDocSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function storeLocalDraft(doc: ResumeDoc | null) {
  try {
    if (doc) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode or storage disabled: the builder still works, it just
    // won't remember the draft across reloads.
  }
}

/**
 * The public /resume-builder page: starts from the default resume, keeps the
 * draft in this browser, downloads the PDF without an account, and saves to
 * the account when the visitor is signed in.
 */
export function PublicBuilder({ initial, loggedIn }: { initial: ResumeDoc; loggedIn: boolean }) {
  const router = useRouter();
  // Rendered client-only (see public-builder-loader.tsx), so a draft from an
  // earlier visit can be read straight into the first render.
  const [doc, setDoc] = useState<ResumeDoc>(() => loadLocalDraft() ?? initial);
  const [downloading, setDownloading] = useState(false);
  const [saving, startSaving] = useTransition();

  const update: Update = useCallback((fn) => setDoc((d) => fn(d)), []);
  const insights = useResumeInsights(doc);

  useEffect(() => {
    storeLocalDraft(doc);
  }, [doc]);

  async function download() {
    setDownloading(true);
    try {
      const res = await fetch("/api/builder/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: doc }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "Couldn't build the PDF. Try again.");
        return;
      }
      const url = URL.createObjectURL(await res.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = pdfFileName(doc, "Resume");
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error("Network error. Check your connection and try again.");
    } finally {
      setDownloading(false);
    }
  }

  function saveToAccount() {
    startSaving(async () => {
      const result = await saveGuestDraft(doc);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      storeLocalDraft(null);
      toast.success("Saved to your account.");
      router.push(`/builder/${result.resumeId}`);
    });
  }

  return (
    <AiDraftingContext.Provider value={loggedIn}>
      <div className="sticky top-16 z-30 border-b border-line bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3 lg:px-8">
          <div className="min-w-0">
            <h1 className="text-[17px] font-bold tracking-[-0.01em] text-brand">Resume builder</h1>
            <p className="text-[12.5px] text-ink-muted">
              {loggedIn
                ? "Your draft is kept in this browser until you save it to your account."
                : "Free, no account needed. Your draft is kept in this browser."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {loggedIn ? (
              <Button variant="secondary" size="sm" onClick={saveToAccount} disabled={saving}>
                {saving ? "Saving…" : "Save to my account"}
              </Button>
            ) : (
              <Link href="/signup" className={buttonVariants({ variant: "secondary", size: "sm" })}>
                Sign up to save
              </Link>
            )}
            <Button size="sm" onClick={download} disabled={downloading}>
              <Download size={15} /> {downloading ? "Building PDF…" : "Download PDF"}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-5 pb-16 lg:px-8">
        <ResumeWorkspace
          doc={doc}
          update={update}
          insights={insights}
          previewStickyClass="lg:top-[9.5rem] lg:max-h-[calc(100vh-11rem)]"
        />
      </div>
    </AiDraftingContext.Provider>
  );
}
