"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { BuilderSectionType } from "@/lib/ai/generate";

const SECTIONS: { key: BuilderSectionType; label: string; placeholder: string }[] = [
  {
    key: "summary",
    label: "Professional summary",
    placeholder: "Years of experience, role, what you're known for...",
  },
  {
    key: "experience",
    label: "Experience",
    placeholder: "Company, title, dates, and what you did/achieved...",
  },
  {
    key: "skills",
    label: "Skills",
    placeholder: "Tools, languages, frameworks, certifications...",
  },
  {
    key: "education",
    label: "Education",
    placeholder: "Degree, school, graduation year...",
  },
];

type SectionState = { input: string; content: string; bullets?: string[] };
export type EditorState = Record<BuilderSectionType, SectionState>;

export function BuilderEditor({
  resumeId,
  initial,
}: {
  resumeId: string;
  initial: Partial<EditorState>;
}) {
  const [state, setState] = useState<EditorState>(() => {
    const base = {} as EditorState;
    for (const s of SECTIONS) {
      base[s.key] = initial[s.key] ?? { input: "", content: "" };
    }
    return base;
  });
  const [generating, setGenerating] = useState<BuilderSectionType | null>(null);
  const [saving, setSaving] = useState(false);

  function updateInput(key: BuilderSectionType, input: string) {
    setState((prev) => ({ ...prev, [key]: { ...prev[key], input } }));
  }

  function updateContent(key: BuilderSectionType, content: string) {
    setState((prev) => ({ ...prev, [key]: { ...prev[key], content } }));
  }

  async function generate(key: BuilderSectionType) {
    if (!state[key].input.trim()) {
      toast.error("Add some notes for this section first.");
      return;
    }
    setGenerating(key);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: key, input: state[key].input }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Generation failed.");
        return;
      }
      setState((prev) => ({
        ...prev,
        [key]: { ...prev[key], content: body.content, bullets: body.bullets },
      }));
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setGenerating(null);
    }
  }

  async function saveDraft() {
    setSaving(true);
    try {
      const res = await fetch("/api/builder/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, content: state }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Save failed.");
        return;
      }
      toast.success("Draft saved.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {SECTIONS.map((section) => (
        <Card key={section.key}>
          <CardHeader>
            <CardTitle className="text-base">{section.label}</CardTitle>
            <CardDescription>Your notes — AI drafts the wording, grounded only in what you write here.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${section.key}-input`}>Your notes</Label>
              <Textarea
                id={`${section.key}-input`}
                rows={3}
                placeholder={section.placeholder}
                value={state[section.key].input}
                onChange={(e) => updateInput(section.key, e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="self-start"
              disabled={generating === section.key}
              onClick={() => generate(section.key)}
            >
              {generating === section.key ? "Generating..." : "Generate with AI"}
            </Button>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${section.key}-content`}>Drafted section (editable)</Label>
              <Textarea
                id={`${section.key}-content`}
                rows={4}
                value={state[section.key].content}
                onChange={(e) => updateContent(section.key, e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={saveDraft} disabled={saving} className="self-start">
        {saving ? "Saving..." : "Save draft"}
      </Button>
    </div>
  );
}
