"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import type { ResumeDoc } from "@/lib/builder/schema";
import {
  SECTION_HEADINGS,
  contactLines,
  displayUrl,
  formatMonth,
  formatRange,
  joinComma,
  orderedSections,
  visibleContent,
  type SectionKey,
} from "@/lib/builder/format";

/**
 * HTML mirror of lib/pdf/resume-document.tsx. Sizes are the PDF's points
 * converted to CSS pixels (1pt = 4/3px) so the preview paginates close to
 * the real download.
 */

const PT = 4 / 3;
const PAGE = {
  A4: { width: 595.28 * PT, height: 841.89 * PT },
  LETTER: { width: 612 * PT, height: 792 * PT },
} as const;
const PAD_Y = 38 * PT;
const PAD_X = 46 * PT;

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const sheetFont: CSSProperties = {
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: 10 * PT,
  lineHeight: 1.38,
  color: "#18202b",
};

function EntryHeader({ title, date }: { title: string; date: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 * PT }}>
      <span style={{ fontWeight: 700 }}>{title}</span>
      {date ? <span style={{ color: "#4a5361", flexShrink: 0 }}>{date}</span> : null}
    </div>
  );
}

const org: CSSProperties = { fontStyle: "italic", color: "#4a5361" };

function Bullets({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {items.map((b, i) => (
        <li key={i} style={{ display: "flex", marginTop: 1.5 * PT, paddingLeft: 2 * PT }}>
          <span style={{ width: 10 * PT, flexShrink: 0 }}>•</span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

function Body({ k, content }: { k: SectionKey; content: ReturnType<typeof visibleContent> }): ReactNode {
  const entry: CSSProperties = { marginBottom: 7 * PT };
  switch (k) {
    case "summary":
      return <p style={{ margin: 0 }}>{content.summary}</p>;
    case "experience":
      return content.experience.map((e) => (
        <div key={e.id} style={entry}>
          <EntryHeader title={e.title.trim()} date={formatRange(e.start, e.end, e.current)} />
          {joinComma(e.company, e.location) ? <div style={org}>{joinComma(e.company, e.location)}</div> : null}
          <Bullets items={e.bullets} />
        </div>
      ));
    case "projects":
      return content.projects.map((p) => (
        <div key={p.id} style={entry}>
          <EntryHeader
            title={[p.name.trim(), displayUrl(p.link)].filter(Boolean).join(" | ")}
            date={formatRange(p.start, p.end)}
          />
          {p.tech.trim() ? <div style={org}>Tech: {p.tech.trim()}</div> : null}
          <Bullets items={p.bullets} />
        </div>
      ));
    case "education":
      return content.education.map((e) => {
        const line2 = [joinComma(e.school, e.location), e.grade.trim()].filter(Boolean).join(" | ");
        return (
          <div key={e.id} style={entry}>
            <EntryHeader title={e.degree.trim()} date={formatRange(e.start, e.end)} />
            {line2 ? <div style={org}>{line2}</div> : null}
            {e.details.trim() ? <div style={{ color: "#4a5361" }}>{e.details.trim()}</div> : null}
          </div>
        );
      });
    case "skills":
      return content.skills.map((g) => (
        <p key={g.id} style={{ margin: `0 0 ${2 * PT}px` }}>
          {g.label.trim() ? <strong>{g.label.trim()}: </strong> : null}
          {g.list.join(", ")}
        </p>
      ));
    case "certifications":
      return content.certifications.map((c) => (
        <EntryHeader key={c.id} title={joinComma(c.name, c.issuer)} date={formatMonth(c.date)} />
      ));
    case "achievements":
      return <Bullets items={content.achievements} />;
  }
}

export function ResumePreview({
  doc,
  onPageCount,
}: {
  doc: ResumeDoc;
  onPageCount?: (pages: number) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  const [contentHeight, setContentHeight] = useState(0);

  const page = PAGE[doc.settings.pageSize];
  const usable = page.height - PAD_Y * 2;
  const pages = Math.max(1, Math.ceil((contentHeight - PAD_Y * 2) / usable));
  const sheetHeight = pages * page.height;

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / page.width));
    ro.observe(frame);
    return () => ro.disconnect();
  }, [page.width]);

  useIsoLayoutEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const ro = new ResizeObserver(() => setContentHeight(sheet.scrollHeight));
    ro.observe(sheet);
    return () => ro.disconnect();
  }, []);

  useEffect(() => onPageCount?.(pages), [pages, onPageCount]);

  const content = visibleContent(doc);
  const sections = orderedSections(doc, content);
  const { contact } = doc;
  const lines = contactLines(contact);
  const isEmpty = !contact.fullName.trim() && sections.length === 0 && lines.length === 0;

  return (
    <div ref={frameRef} className="w-full">
      <div className="relative" style={{ height: sheetHeight * scale }}>
        <div
          className="absolute left-0 top-0 origin-top-left bg-white shadow-[0_24px_48px_-28px_rgba(20,22,27,0.35)] ring-1 ring-line"
          style={{ width: page.width, height: sheetHeight, transform: `scale(${scale})` }}
        >
          {/* Page-break guides: where the PDF will start a new page (approximate). */}
          {Array.from({ length: pages - 1 }, (_, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="absolute inset-x-0 border-t-2 border-dashed border-signal/70"
              style={{ top: (i + 1) * page.height }}
            >
              <span className="absolute right-3 top-1 bg-signal-soft px-2 py-0.5 font-sans text-[18px] font-medium text-ink">
                Page {i + 2}
              </span>
            </div>
          ))}

          <div ref={sheetRef} style={{ ...sheetFont, padding: `${PAD_Y}px ${PAD_X}px` }}>
            {isEmpty ? (
              <div className="flex flex-col gap-4 pt-6" style={{ minHeight: usable }}>
                <span className="block h-[22px] w-[42%] rounded-full bg-line" />
                <span className="block h-[12px] w-[64%] rounded-full bg-line" />
                <p className="mt-10 max-w-[30ch] font-sans text-[22px] leading-snug text-ink-faint">
                  Start with your name and email. The page fills in as you type.
                </p>
              </div>
            ) : null}

            {contact.fullName.trim() ? (
              <div style={{ fontSize: 20 * PT, fontWeight: 700, lineHeight: 1.1 }}>{contact.fullName.trim()}</div>
            ) : null}
            {contact.headline.trim() ? (
              <div style={{ fontSize: 11 * PT, color: "#4a5361", marginTop: 3 * PT }}>{contact.headline.trim()}</div>
            ) : null}
            {lines.map((line, n) => (
              <div key={n} style={{ fontSize: 9.5 * PT, color: "#4a5361", marginTop: (n === 0 ? 5 : 1) * PT }}>
                {line.join("  |  ")}
              </div>
            ))}

            {sections.map((key) => (
              <section key={key} style={{ marginTop: 12 * PT }}>
                <h4
                  style={{
                    margin: `0 0 ${5 * PT}px`,
                    fontSize: 10.5 * PT,
                    fontWeight: 700,
                    letterSpacing: 0.9 * PT,
                    paddingBottom: 2 * PT,
                    borderBottom: `${0.75 * PT}px solid #9aa3ae`,
                  }}
                >
                  {SECTION_HEADINGS[key].toUpperCase()}
                </h4>
                <Body k={key} content={content} />
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
