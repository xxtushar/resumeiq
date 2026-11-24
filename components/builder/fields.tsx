"use client";

import { useId, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2, X } from "lucide-react";

import { cn } from "@/lib/utils";

/** Matches the app's Textarea: square-ish corners, strong hairline, navy focus. */
export const fieldClass =
  "w-full rounded-[4px] border border-line-strong bg-paper-raised px-3 text-[14px] text-ink placeholder:text-ink-faint focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:opacity-50";

export function Field({
  label,
  hint,
  className,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-[12.5px] font-medium text-ink-muted">
        {label}
      </label>
      {children}
      {hint ? <p className="text-[12px] text-ink-faint">{hint}</p> : null}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  className,
  type = "text",
  autoComplete,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  className?: string;
  type?: "text" | "email" | "tel" | "url";
  autoComplete?: string;
  maxLength?: number;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} className={className} htmlFor={id}>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className={cn(fieldClass, "h-9")}
      />
    </Field>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 3,
  className,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
  className?: string;
  maxLength?: number;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} className={className} htmlFor={id}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className={cn(fieldClass, "resize-y py-2.5 leading-relaxed [field-sizing:content]")}
      />
    </Field>
  );
}

const MONTH_OPTIONS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Month + year as two small controls, stored as "YYYY-MM" or "YYYY".
 * Avoids <input type="month">, which Safari renders as a free-text box. */
export function MonthYearField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const [initialYear, initialMonth] = value.split("-");
  const [year, setYear] = useState(initialYear ?? "");
  const [month, setMonth] = useState(initialMonth ?? "");

  function emit(nextYear: string, nextMonth: string) {
    if (/^\d{4}$/.test(nextYear)) onChange(nextMonth ? `${nextYear}-${nextMonth}` : nextYear);
    else onChange("");
  }

  return (
    <Field label={label} htmlFor={id}>
      <div className="flex gap-1.5">
        <select
          aria-label={`${label} month`}
          value={month}
          disabled={disabled}
          onChange={(e) => {
            setMonth(e.target.value);
            emit(year, e.target.value);
          }}
          className={cn(fieldClass, "h-9 w-[5.5rem] shrink-0 px-2")}
        >
          <option value="">Month</option>
          {MONTH_OPTIONS.map((m, i) => (
            <option key={m} value={String(i + 1).padStart(2, "0")}>
              {m}
            </option>
          ))}
        </select>
        <input
          id={id}
          inputMode="numeric"
          placeholder="Year"
          aria-label={`${label} year`}
          maxLength={4}
          value={year}
          disabled={disabled}
          onChange={(e) => {
            const next = e.target.value.replace(/\D/g, "").slice(0, 4);
            setYear(next);
            emit(next, month);
          }}
          className={cn(fieldClass, "h-9 min-w-0 tabular-nums")}
        />
      </div>
    </Field>
  );
}

/** Editable bullet list: one textarea per bullet, add/remove/reorder. */
export function BulletList({
  label = "Bullet points",
  bullets,
  onChange,
  placeholder,
  max = 12,
}: {
  label?: string;
  bullets: string[];
  onChange: (bullets: string[]) => void;
  placeholder?: string;
  max?: number;
}) {
  const set = (i: number, value: string) =>
    onChange(bullets.map((b, j) => (j === i ? value : b)));

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[12.5px] font-medium text-ink-muted">{label}</p>
      <ul className="flex flex-col gap-2">
        {bullets.map((bullet, i) => {
          const long = bullet.length > 240;
          return (
            <li key={i} className="group flex items-start gap-2">
              <span aria-hidden="true" className="mt-2.5 select-none text-[14px] leading-none text-ink-faint">
                •
              </span>
              <div className="min-w-0 flex-1">
                <textarea
                  aria-label={`${label} ${i + 1}`}
                  rows={2}
                  value={bullet}
                  placeholder={i === 0 ? placeholder : undefined}
                  maxLength={400}
                  onChange={(e) => set(i, e.target.value.replace(/\n/g, " "))}
                  className={cn(
                    fieldClass,
                    "resize-none py-2 leading-relaxed [field-sizing:content]",
                    long && "border-signal focus-visible:border-signal",
                  )}
                />
                {long ? (
                  <p className="mt-1 text-[12px] text-signal">
                    {bullet.length} characters — past two lines on the page.
                  </p>
                ) : null}
              </div>
              <div className="mt-1 flex flex-col">
                <IconButton
                  label="Move bullet up"
                  disabled={i === 0}
                  onClick={() => onChange(move(bullets, i, -1))}
                >
                  <ArrowUp size={14} />
                </IconButton>
                <IconButton
                  label="Remove bullet"
                  onClick={() => onChange(bullets.filter((_, j) => j !== i))}
                >
                  <X size={14} />
                </IconButton>
              </div>
            </li>
          );
        })}
      </ul>
      {bullets.length < max ? (
        <button
          type="button"
          onClick={() => onChange([...bullets, ""])}
          className="flex items-center gap-1.5 self-start pl-4 text-[13px] font-medium text-accent-blue hover:text-brand"
        >
          <Plus size={14} /> Add bullet
        </button>
      ) : null}
    </div>
  );
}

export function IconButton({
  label,
  onClick,
  disabled,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-7 items-center justify-center rounded-[4px] text-ink-faint transition-colors hover:bg-paper hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-30",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** One repeatable entry (a role, a project, a degree): collapsible, with
 * reorder and remove in its header. */
export function EntryShell({
  title,
  subtitle,
  index,
  count,
  defaultOpen = true,
  onMove,
  onRemove,
  children,
}: {
  title: string;
  subtitle?: string;
  index: number;
  count: number;
  defaultOpen?: boolean;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-[6px] border border-line bg-paper-raised">
      <div className="flex items-center gap-2 py-2 pl-3 pr-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-[4px] py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <ChevronDown
            size={16}
            className={cn("shrink-0 text-ink-faint transition-transform", !open && "-rotate-90")}
          />
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-semibold text-ink">{title}</span>
            {subtitle ? (
              <span className="block truncate text-[12.5px] text-ink-muted">{subtitle}</span>
            ) : null}
          </span>
        </button>
        <IconButton label="Move up" disabled={index === 0} onClick={() => onMove(-1)}>
          <ArrowUp size={15} />
        </IconButton>
        <IconButton label="Move down" disabled={index === count - 1} onClick={() => onMove(1)}>
          <ArrowDown size={15} />
        </IconButton>
        <IconButton label="Remove" onClick={onRemove} className="hover:bg-warn-soft hover:text-warn">
          <Trash2 size={15} />
        </IconButton>
      </div>
      {open ? <div className="flex flex-col gap-4 border-t border-line p-4">{children}</div> : null}
    </div>
  );
}

export function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-[6px] border border-dashed border-line-strong text-[13.5px] font-medium text-ink-muted transition-colors hover:border-brand hover:bg-paper-raised hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <Plus size={15} /> {children}
    </button>
  );
}

export function move<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const target = index + dir;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
