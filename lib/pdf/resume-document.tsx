import {
  Document,
  Font,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
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
 * The ATS template. Deliberately plain: one column in reading order, a
 * standard font, standard headings, contact details in the body (not a
 * page header), real text only — no images, icons, tables or text boxes.
 */

// react-pdf hyphenates long words by default, which splits keywords like
// "TypeScript" across lines and breaks keyword matching. Never hyphenate.
Font.registerHyphenationCallback((word) => [word]);

const INK = "#18202b";
const MUTED = "#4a5361";
const RULE = "#9aa3ae";

const styles = StyleSheet.create({
  page: {
    paddingTop: 38,
    paddingBottom: 38,
    paddingHorizontal: 46,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.38,
    color: INK,
  },
  name: { fontSize: 20, fontFamily: "Helvetica-Bold", lineHeight: 1.1 },
  headline: { fontSize: 11, color: MUTED, marginTop: 3 },
  contact: { fontSize: 9.5, color: MUTED, marginTop: 5 },
  contactNext: { fontSize: 9.5, color: MUTED, marginTop: 1 },
  link: { color: MUTED, textDecoration: "none" },
  section: { marginTop: 12 },
  heading: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.9,
    paddingBottom: 2,
    marginBottom: 5,
    borderBottomWidth: 0.75,
    borderBottomColor: RULE,
  },
  entry: { marginBottom: 7 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  title: { fontFamily: "Helvetica-Bold", flexShrink: 1, paddingRight: 8 },
  date: { color: MUTED, flexShrink: 0 },
  org: { fontFamily: "Helvetica-Oblique", color: MUTED },
  meta: { color: MUTED },
  bulletRow: { flexDirection: "row", marginTop: 1.5, paddingLeft: 2 },
  bulletMark: { width: 10 },
  bulletText: { flex: 1 },
  skillLabel: { fontFamily: "Helvetica-Bold" },
});

function Bullets({ items }: { items: string[] }) {
  return (
    <>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletRow} wrap={false}>
          <Text style={styles.bulletMark}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </>
  );
}

function EntryHeader({ title, date }: { title: string; date: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {date ? <Text style={styles.date}>{date}</Text> : null}
    </View>
  );
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading} minPresenceAhead={36}>
        {heading.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

function SectionBody({ k, content }: { k: SectionKey; content: ReturnType<typeof visibleContent> }) {
  switch (k) {
    case "summary":
      return <Text>{content.summary}</Text>;

    case "experience":
      return (
        <>
          {content.experience.map((e) => (
            <View key={e.id} style={styles.entry}>
              <View wrap={false}>
                <EntryHeader title={e.title.trim()} date={formatRange(e.start, e.end, e.current)} />
                {joinComma(e.company, e.location) ? (
                  <Text style={styles.org}>{joinComma(e.company, e.location)}</Text>
                ) : null}
              </View>
              <Bullets items={e.bullets} />
            </View>
          ))}
        </>
      );

    case "projects":
      return (
        <>
          {content.projects.map((p) => (
            <View key={p.id} style={styles.entry}>
              <View wrap={false}>
                <EntryHeader
                  title={[p.name.trim(), displayUrl(p.link)].filter(Boolean).join(" | ")}
                  date={formatRange(p.start, p.end)}
                />
                {p.tech.trim() ? <Text style={styles.org}>Tech: {p.tech.trim()}</Text> : null}
              </View>
              <Bullets items={p.bullets} />
            </View>
          ))}
        </>
      );

    case "education":
      return (
        <>
          {content.education.map((e) => {
            const line2 = [joinComma(e.school, e.location), e.grade.trim()].filter(Boolean).join(" | ");
            return (
              <View key={e.id} style={styles.entry} wrap={false}>
                <EntryHeader title={e.degree.trim()} date={formatRange(e.start, e.end)} />
                {line2 ? <Text style={styles.org}>{line2}</Text> : null}
                {e.details.trim() ? <Text style={styles.meta}>{e.details.trim()}</Text> : null}
              </View>
            );
          })}
        </>
      );

    case "skills":
      return (
        <>
          {content.skills.map((g) => (
            <Text key={g.id} style={{ marginBottom: 2 }}>
              {g.label.trim() ? <Text style={styles.skillLabel}>{g.label.trim()}: </Text> : null}
              {g.list.join(", ")}
            </Text>
          ))}
        </>
      );

    case "certifications":
      return (
        <>
          {content.certifications.map((c) => (
            <EntryHeader key={c.id} title={joinComma(c.name, c.issuer)} date={formatMonth(c.date)} />
          ))}
        </>
      );

    case "achievements":
      return <Bullets items={content.achievements} />;
  }
}

export function ResumeDocument({ doc, title }: { doc: ResumeDoc; title: string }) {
  const content = visibleContent(doc);
  const { contact } = doc;
  const lines = contactLines(contact);
  const links = new Set([displayUrl(contact.linkedin), displayUrl(contact.website)].filter(Boolean));
  const name = contact.fullName.trim();

  return (
    <Document
      title={name ? `${name} – Resume` : title}
      author={name || undefined}
      subject="Resume"
      creator="ResumeIQ"
      producer="ResumeIQ"
    >
      <Page size={doc.settings.pageSize} style={styles.page}>
        {name ? <Text style={styles.name}>{name}</Text> : null}
        {contact.headline.trim() ? <Text style={styles.headline}>{contact.headline.trim()}</Text> : null}
        {lines.map((line, n) => (
          <Text key={n} style={n === 0 ? styles.contact : styles.contactNext}>
            {line.map((part, i) => (
              <Text key={part}>
                {i > 0 ? "  |  " : ""}
                {links.has(part) ? (
                  <Link src={`https://${part}`} style={styles.link}>
                    {part}
                  </Link>
                ) : part.includes("@") ? (
                  <Link src={`mailto:${part}`} style={styles.link}>
                    {part}
                  </Link>
                ) : (
                  part
                )}
              </Text>
            ))}
          </Text>
        ))}

        {orderedSections(doc, content).map((key) => (
          <Section key={key} heading={SECTION_HEADINGS[key]}>
            <SectionBody k={key} content={content} />
          </Section>
        ))}
      </Page>
    </Document>
  );
}

export function renderResumePdfBuffer(doc: ResumeDoc, title: string): Promise<Buffer> {
  return renderToBuffer(<ResumeDocument doc={doc} title={title} />);
}
