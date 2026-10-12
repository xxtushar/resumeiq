"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Option = { id: string; label: string };

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm text-ink outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AnalyzeForm({
  resumes,
  jobs,
  initialResumeId,
}: {
  resumes: Option[];
  jobs: Option[];
  initialResumeId?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeMode, setResumeMode] = useState<"upload" | "existing">(
    initialResumeId ? "existing" : "upload"
  );
  const [jobMode, setJobMode] = useState<"paste" | "saved" | "none">("paste");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const formData = new FormData(event.currentTarget);
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.error ?? "Something went wrong.");
        return;
      }

      router.push(`/analyze/${body.resumeId}?analysis=${body.analysisId}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2" disabled={pending}>
        <legend className="mb-2 text-sm font-medium text-ink">Resume</legend>
        {resumes.length > 0 && (
          <Segmented
            value={resumeMode}
            onChange={setResumeMode}
            options={[
              { value: "upload", label: "Upload new" },
              { value: "existing", label: "Use existing" },
            ]}
          />
        )}
        {resumeMode === "upload" ? (
          <>
            <Label htmlFor="file" className="sr-only">
              Resume file
            </Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept=".pdf,.docx,.txt"
              required
            />
            <p className="text-[12.5px] text-ink-muted">PDF, DOCX, or TXT — max 5MB.</p>
          </>
        ) : (
          <>
            <Label htmlFor="resumeId" className="sr-only">
              Existing resume
            </Label>
            <select
              id="resumeId"
              name="resumeId"
              defaultValue={initialResumeId}
              required
              className={selectClassName}
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2" disabled={pending}>
        <legend className="mb-2 text-sm font-medium text-ink">Target job</legend>
        <Segmented
          value={jobMode}
          onChange={setJobMode}
          options={[
            { value: "paste", label: "Paste posting" },
            ...(jobs.length > 0 ? [{ value: "saved" as const, label: "Saved job" }] : []),
            { value: "none", label: "No job" },
          ]}
        />
        {jobMode === "paste" && (
          <>
            <Label htmlFor="jobDescription" className="sr-only">
              Job description
            </Label>
            <Textarea
              id="jobDescription"
              name="jobDescription"
              rows={7}
              required
              placeholder="Paste the job posting. It's saved and parsed into requirements so you can reuse it."
            />
          </>
        )}
        {jobMode === "saved" && (
          <>
            <Label htmlFor="jobId" className="sr-only">
              Saved job
            </Label>
            <select id="jobId" name="jobId" required className={selectClassName}>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.label}
                </option>
              ))}
            </select>
          </>
        )}
        {jobMode === "none" && (
          <p className="text-[12.5px] text-ink-muted">
            General quality and ATS review, without matching against a role.
          </p>
        )}
      </fieldset>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Analyzing — this takes up to a minute..." : "Analyze resume"}
      </Button>
    </form>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div
      role="radiogroup"
      className="inline-flex w-fit gap-0.5 rounded-[6px] border border-line bg-paper p-0.5"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-[4px] px-3 py-1 text-[13px] transition-colors",
            value === option.value
              ? "bg-paper-raised font-medium text-ink shadow-sm"
              : "text-ink-muted hover:text-ink"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
