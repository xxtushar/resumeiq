"use client";

import type { ReactNode } from "react";
import { toast } from "sonner";

import {
  AddButton,
  BulletList,
  EntryShell,
  MonthYearField,
  TextAreaField,
  TextField,
  move,
} from "@/components/builder/fields";
import { AiNotes, requestDraft, toBullets } from "@/components/builder/ai-notes";
import {
  LIMITS,
  blankCertification,
  blankEducation,
  blankExperience,
  blankProject,
  blankSkillGroup,
  type ResumeDoc,
} from "@/lib/builder/schema";
import { formatRange, splitSkills, type SectionKey } from "@/lib/builder/format";

export type Update = (fn: (doc: ResumeDoc) => ResumeDoc) => void;

type ListKey = "experience" | "projects" | "education" | "skills" | "certifications";
type Item<K extends ListKey> = ResumeDoc[K][number];

/** Immutable helpers for the repeatable sections. */
function listOps<K extends ListKey>(key: K, update: Update) {
  const setList = (fn: (list: Item<K>[]) => Item<K>[]) =>
    update((d) => ({ ...d, [key]: fn(d[key] as Item<K>[]) }));
  return {
    patch: (id: string, patch: Partial<Item<K>>) =>
      setList((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item))),
    add: (item: Item<K>) => setList((list) => [...list, item]),
    remove: (id: string) => setList((list) => list.filter((item) => item.id !== id)),
    move: (index: number, dir: -1 | 1) => setList((list) => move(list, index, dir)),
  };
}

export function SectionCard({
  id,
  title,
  hint,
  children,
}: {
  id: string;
  title: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 rounded-[6px] border border-line bg-paper-raised"
    >
      <header className="px-5 pb-1 pt-5">
        <h3 id={`${id}-title`} className="text-[16px] font-bold tracking-[-0.01em] text-brand">
          {title}
        </h3>
        {hint ? <p className="mt-1 max-w-[62ch] text-[13px] leading-relaxed text-ink-muted">{hint}</p> : null}
      </header>
      <div className="flex flex-col gap-4 p-5 pt-4">{children}</div>
    </section>
  );
}

/** Replaces bullets with an AI draft, with an Undo in the toast. */
function applyBullets<K extends "experience" | "projects">(
  key: K,
  id: string,
  next: string[],
  previous: string[],
  update: Update,
) {
  const ops = listOps(key, update);
  ops.patch(id, { bullets: next } as Partial<Item<K>>);
  if (previous.some((b) => b.trim())) {
    toast.success("Bullets drafted.", {
      action: { label: "Undo", onClick: () => ops.patch(id, { bullets: previous } as Partial<Item<K>>) },
    });
  } else {
    toast.success("Bullets drafted. Edit anything that isn't quite right.");
  }
}

export function ContactEditor({ doc, update }: { doc: ResumeDoc; update: Update }) {
  const set = (field: keyof ResumeDoc["contact"]) => (value: string) =>
    update((d) => ({ ...d, contact: { ...d.contact, [field]: value } }));
  const c = doc.contact;
  return (
    <SectionCard
      id="contact"
      title="Contact"
      hint="Goes in the body of the page, not a header — many parsers skip page headers entirely."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" value={c.fullName} onChange={set("fullName")} autoComplete="name" maxLength={LIMITS.shortText} placeholder="Tushar Singh" />
        <TextField label="Headline" value={c.headline} onChange={set("headline")} maxLength={LIMITS.shortText} placeholder="Full-stack Developer" hint="Use the job title you're applying for." />
        <TextField label="Email" type="email" value={c.email} onChange={set("email")} autoComplete="email" maxLength={LIMITS.shortText} placeholder="you@example.com" />
        <TextField label="Phone" type="tel" value={c.phone} onChange={set("phone")} autoComplete="tel" maxLength={LIMITS.shortText} placeholder="+91 98765 43210" />
        <TextField label="Location" value={c.location} onChange={set("location")} maxLength={LIMITS.shortText} placeholder="Bengaluru, India" hint="City and country is enough." />
        <TextField label="LinkedIn" type="url" value={c.linkedin} onChange={set("linkedin")} maxLength={LIMITS.url} placeholder="linkedin.com/in/yourname" />
        <TextField label="Portfolio or GitHub" type="url" value={c.website} onChange={set("website")} maxLength={LIMITS.url} placeholder="github.com/yourname" className="sm:col-span-2" />
      </div>
    </SectionCard>
  );
}

export function SummaryEditor({ doc, update }: { doc: ResumeDoc; update: Update }) {
  async function draft() {
    const context = [
      doc.contact.headline && `Target role: ${doc.contact.headline}`,
      doc.experience.filter((e) => e.title).length
        ? `Roles: ${doc.experience.filter((e) => e.title).map((e) => [e.title, e.company].filter(Boolean).join(" at ")).join("; ")}`
        : null,
      `Notes: ${doc.summaryNotes ?? ""}`,
    ]
      .filter(Boolean)
      .join("\n");
    const result = await requestDraft("summary", context);
    if (!result) return;
    const previous = doc.summary;
    update((d) => ({ ...d, summary: result.content.trim().slice(0, LIMITS.summary) }));
    toast.success("Summary drafted.", previous.trim()
      ? { action: { label: "Undo", onClick: () => update((d) => ({ ...d, summary: previous })) } }
      : undefined);
  }

  return (
    <SectionCard
      id="summary"
      title="Summary"
      hint="Two or three sentences: what you do, your strongest area, and one concrete result."
    >
      <TextAreaField
        label="Summary"
        rows={4}
        value={doc.summary}
        maxLength={LIMITS.summary}
        onChange={(summary) => update((d) => ({ ...d, summary }))}
        placeholder="Full-stack developer who ships AI-integrated web products in Next.js and TypeScript…"
      />
      <AiNotes
        notes={doc.summaryNotes ?? ""}
        onNotesChange={(summaryNotes) => update((d) => ({ ...d, summaryNotes }))}
        onDraft={draft}
        actionLabel="Write summary"
        placeholder="e.g. final-year CSE student, freelance web dev for 2 years, built a RAG resume tool, want backend/AI roles"
      />
    </SectionCard>
  );
}

export function ExperienceEditor({ doc, update }: { doc: ResumeDoc; update: Update }) {
  const ops = listOps("experience", update);
  return (
    <SectionCard
      id="experience"
      title="Experience"
      hint="Most recent first. Internships and freelance work count — list the client or “Freelance” as the company."
    >
      {doc.experience.map((e, i) => (
        <EntryShell
          key={e.id}
          index={i}
          count={doc.experience.length}
          title={e.title || "New role"}
          subtitle={[e.company, formatRange(e.start, e.end, e.current)].filter(Boolean).join(", ")}
          onMove={(dir) => ops.move(i, dir)}
          onRemove={() => ops.remove(e.id)}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Job title" value={e.title} maxLength={LIMITS.shortText} onChange={(title) => ops.patch(e.id, { title })} placeholder="Frontend Developer Intern" />
            <TextField label="Company" value={e.company} maxLength={LIMITS.shortText} onChange={(company) => ops.patch(e.id, { company })} placeholder="Acme Labs" />
            <TextField label="Location" value={e.location} maxLength={LIMITS.shortText} onChange={(location) => ops.patch(e.id, { location })} placeholder="Remote" className="sm:col-span-2" />
            <MonthYearField label="Start" value={e.start} onChange={(start) => ops.patch(e.id, { start })} />
            <div className="flex flex-col gap-2">
              <MonthYearField label="End" value={e.end} disabled={e.current} onChange={(end) => ops.patch(e.id, { end })} />
              <label className="flex items-center gap-2 text-[13px] text-ink-muted">
                <input
                  type="checkbox"
                  checked={e.current}
                  onChange={(ev) => ops.patch(e.id, { current: ev.target.checked })}
                  className="size-4 accent-[var(--brand)]"
                />
                Current role
              </label>
            </div>
          </div>
          <BulletList
            bullets={e.bullets}
            onChange={(bullets) => ops.patch(e.id, { bullets })}
            placeholder="Built the checkout flow in Next.js, cutting drop-off by 18%"
          />
          <AiNotes
            notes={e.notes ?? ""}
            onNotesChange={(notes) => ops.patch(e.id, { notes })}
            actionLabel="Write bullets"
            placeholder="What you worked on, the tools, and anything that improved — users, speed, revenue, time saved."
            onDraft={async () => {
              const input = [
                `Role: ${[e.title, e.company].filter(Boolean).join(" at ")}`,
                formatRange(e.start, e.end, e.current) && `Dates: ${formatRange(e.start, e.end, e.current)}`,
                `Notes: ${e.notes ?? ""}`,
              ].filter(Boolean).join("\n");
              const result = await requestDraft("experience", input);
              if (result) applyBullets("experience", e.id, toBullets(result), e.bullets, update);
            }}
          />
        </EntryShell>
      ))}
      {doc.experience.length < LIMITS.entries ? (
        <AddButton onClick={() => ops.add(blankExperience())}>Add a role</AddButton>
      ) : null}
    </SectionCard>
  );
}

export function ProjectsEditor({ doc, update }: { doc: ResumeDoc; update: Update }) {
  const ops = listOps("projects", update);
  return (
    <SectionCard
      id="projects"
      title="Projects"
      hint="Your strongest evidence early in your career. Name the stack and what it does for its users."
    >
      {doc.projects.map((p, i) => (
        <EntryShell
          key={p.id}
          index={i}
          count={doc.projects.length}
          title={p.name || "New project"}
          subtitle={p.tech}
          onMove={(dir) => ops.move(i, dir)}
          onRemove={() => ops.remove(p.id)}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Project name" value={p.name} maxLength={LIMITS.shortText} onChange={(name) => ops.patch(p.id, { name })} placeholder="ResumeIQ" />
            <TextField label="Link" type="url" value={p.link} maxLength={LIMITS.url} onChange={(link) => ops.patch(p.id, { link })} placeholder="github.com/you/project" />
            <TextField label="Tech used" value={p.tech} maxLength={LIMITS.shortText * 2} onChange={(tech) => ops.patch(p.id, { tech })} placeholder="Next.js, TypeScript, Supabase, pgvector" className="sm:col-span-2" />
            <MonthYearField label="Start" value={p.start} onChange={(start) => ops.patch(p.id, { start })} />
            <MonthYearField label="End" value={p.end} onChange={(end) => ops.patch(p.id, { end })} />
          </div>
          <BulletList
            bullets={p.bullets}
            onChange={(bullets) => ops.patch(p.id, { bullets })}
            placeholder="Built a RAG pipeline over resume chunks with pgvector, matching job requirements to evidence"
          />
          <AiNotes
            notes={p.notes ?? ""}
            onNotesChange={(notes) => ops.patch(p.id, { notes })}
            actionLabel="Write bullets"
            placeholder="What it does, how you built it, and any usage or results."
            onDraft={async () => {
              const input = [
                `Project: ${p.name}`,
                p.tech && `Tech: ${p.tech}`,
                `Notes: ${p.notes ?? ""}`,
              ].filter(Boolean).join("\n");
              const result = await requestDraft("project", input);
              if (result) applyBullets("projects", p.id, toBullets(result), p.bullets, update);
            }}
          />
        </EntryShell>
      ))}
      {doc.projects.length < LIMITS.entries ? (
        <AddButton onClick={() => ops.add(blankProject())}>Add a project</AddButton>
      ) : null}
    </SectionCard>
  );
}

export function EducationEditor({ doc, update }: { doc: ResumeDoc; update: Update }) {
  const ops = listOps("education", update);
  return (
    <SectionCard id="education" title="Education" hint="Write the degree out in full the way the job post does, e.g. “B.Tech, Computer Science and Engineering”.">
      {doc.education.map((e, i) => (
        <EntryShell
          key={e.id}
          index={i}
          count={doc.education.length}
          title={e.degree || "New degree"}
          subtitle={[e.school, formatRange(e.start, e.end)].filter(Boolean).join(", ")}
          onMove={(dir) => ops.move(i, dir)}
          onRemove={() => ops.remove(e.id)}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Degree" value={e.degree} maxLength={LIMITS.shortText} onChange={(degree) => ops.patch(e.id, { degree })} placeholder="B.Tech, Computer Science and Engineering" className="sm:col-span-2" />
            <TextField label="School" value={e.school} maxLength={LIMITS.shortText} onChange={(school) => ops.patch(e.id, { school })} placeholder="SRM Institute of Science and Technology" />
            <TextField label="Location" value={e.location} maxLength={LIMITS.shortText} onChange={(location) => ops.patch(e.id, { location })} placeholder="Ghaziabad" />
            <MonthYearField label="Start" value={e.start} onChange={(start) => ops.patch(e.id, { start })} />
            <MonthYearField label="End (or expected)" value={e.end} onChange={(end) => ops.patch(e.id, { end })} />
            <TextField label="Grade" value={e.grade} maxLength={LIMITS.shortText} onChange={(grade) => ops.patch(e.id, { grade })} placeholder="CGPA 8.6 / 10" />
            <TextField label="Details" value={e.details} maxLength={LIMITS.bullet} onChange={(details) => ops.patch(e.id, { details })} placeholder="Relevant coursework: DBMS, Operating Systems" />
          </div>
        </EntryShell>
      ))}
      {doc.education.length < LIMITS.entries ? (
        <AddButton onClick={() => ops.add(blankEducation())}>Add education</AddButton>
      ) : null}
    </SectionCard>
  );
}

export function SkillsEditor({ doc, update }: { doc: ResumeDoc; update: Update }) {
  const ops = listOps("skills", update);
  const total = doc.skills.reduce((n, g) => n + splitSkills(g.items).length, 0);
  return (
    <SectionCard
      id="skills"
      title="Skills"
      hint={
        <>
          Separate with commas. Use the job post&apos;s exact spelling (“Node.js”, not “Node”) — keyword search is literal.{" "}
          <span className="tabular-nums text-ink">{total} listed.</span>
        </>
      }
    >
      {doc.skills.map((g, i) => (
        <div key={g.id} className="grid items-end gap-3 sm:grid-cols-[11rem_1fr_auto]">
          <TextField label="Group" value={g.label} maxLength={LIMITS.shortText} onChange={(label) => ops.patch(g.id, { label })} placeholder="Languages" />
          <TextField label="Skills" value={g.items} maxLength={LIMITS.skillItems} onChange={(items) => ops.patch(g.id, { items })} placeholder="TypeScript, Python, SQL" />
          <div className="flex pb-1">
            <button
              type="button"
              disabled={i === 0}
              onClick={() => ops.move(i, -1)}
              className="h-7 rounded-[4px] px-2 text-[12.5px] text-ink-faint hover:bg-paper hover:text-ink disabled:opacity-30"
            >
              Up
            </button>
            <button
              type="button"
              onClick={() => ops.remove(g.id)}
              className="h-7 rounded-[4px] px-2 text-[12.5px] text-ink-faint hover:bg-warn-soft hover:text-warn"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      {doc.skills.length < LIMITS.skillGroups ? (
        <AddButton onClick={() => ops.add(blankSkillGroup())}>Add a skill group</AddButton>
      ) : null}
    </SectionCard>
  );
}

export function CertificationsEditor({ doc, update }: { doc: ResumeDoc; update: Update }) {
  const ops = listOps("certifications", update);
  return (
    <SectionCard id="certifications" title="Certifications" hint="Optional. Only ones a recruiter would recognise or the job asks for.">
      {doc.certifications.map((c) => (
        <div key={c.id} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_12rem_auto]">
          <TextField label="Certification" value={c.name} maxLength={LIMITS.shortText} onChange={(name) => ops.patch(c.id, { name })} placeholder="AWS Certified Cloud Practitioner" />
          <TextField label="Issuer" value={c.issuer} maxLength={LIMITS.shortText} onChange={(issuer) => ops.patch(c.id, { issuer })} placeholder="Amazon Web Services" />
          <MonthYearField label="Date" value={c.date} onChange={(date) => ops.patch(c.id, { date })} />
          <button
            type="button"
            onClick={() => ops.remove(c.id)}
            className="mb-1 h-7 rounded-[4px] px-2 text-[12.5px] text-ink-faint hover:bg-warn-soft hover:text-warn"
          >
            Remove
          </button>
        </div>
      ))}
      {doc.certifications.length < LIMITS.entries ? (
        <AddButton onClick={() => ops.add(blankCertification())}>Add a certification</AddButton>
      ) : null}
    </SectionCard>
  );
}

export function AchievementsEditor({ doc, update }: { doc: ResumeDoc; update: Update }) {
  return (
    <SectionCard id="achievements" title="Achievements" hint="Optional. Hackathon wins, rankings, publications, open-source work — anything with a number or a name attached.">
      <BulletList
        label="Achievements"
        bullets={doc.achievements.length ? doc.achievements : []}
        max={LIMITS.achievements}
        onChange={(achievements) => update((d) => ({ ...d, achievements }))}
        placeholder="Won 1st place out of 120 teams at Smart India Hackathon 2025"
      />
    </SectionCard>
  );
}

export const SECTION_EDITORS: Record<SectionKey, (props: { doc: ResumeDoc; update: Update }) => ReactNode> = {
  summary: SummaryEditor,
  experience: ExperienceEditor,
  projects: ProjectsEditor,
  education: EducationEditor,
  skills: SkillsEditor,
  certifications: CertificationsEditor,
  achievements: AchievementsEditor,
};
