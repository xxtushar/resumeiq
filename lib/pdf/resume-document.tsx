import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 12, fontFamily: "Helvetica-Bold" },
  heading: {
    fontSize: 13,
    marginTop: 16,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    paddingBottom: 2,
  },
  paragraph: { marginBottom: 4, lineHeight: 1.4 },
});

export type ResumeSectionContent = { content: string };

export function ResumeDocument({
  title,
  sections,
}: {
  title: string;
  sections: {
    summary?: ResumeSectionContent;
    experience?: ResumeSectionContent;
    skills?: ResumeSectionContent;
    education?: ResumeSectionContent;
  };
}) {
  const order: { key: keyof typeof sections; label: string }[] = [
    { key: "summary", label: "Summary" },
    { key: "experience", label: "Experience" },
    { key: "skills", label: "Skills" },
    { key: "education", label: "Education" },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        {order.map(({ key, label }) => {
          const section = sections[key];
          if (!section?.content?.trim()) return null;
          return (
            <View key={key}>
              <Text style={styles.heading}>{label}</Text>
              {section.content.split("\n").map((line, i) => (
                <Text key={i} style={styles.paragraph}>
                  {line}
                </Text>
              ))}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}

export function renderResumePdfBuffer(
  title: string,
  sections: {
    summary?: ResumeSectionContent;
    experience?: ResumeSectionContent;
    skills?: ResumeSectionContent;
    education?: ResumeSectionContent;
  }
): Promise<Buffer> {
  return renderToBuffer(<ResumeDocument title={title} sections={sections} />);
}
