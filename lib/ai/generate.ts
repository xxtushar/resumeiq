import { runStructured } from "@/lib/ai/client";
import { builderSectionSchema, type BuilderSection } from "@/lib/ai/schemas";

export type BuilderSectionType =
  | "summary"
  | "experience"
  | "skills"
  | "education";

const SECTION_GUIDANCE: Record<BuilderSectionType, string> = {
  summary:
    "Write a 2-3 sentence professional summary. No filler adjectives — lead with concrete scope and impact.",
  experience:
    "Write 3-5 resume bullet points for this role. Each bullet starts with a strong action verb and includes a measurable outcome where the input supports one — never invent numbers.",
  skills:
    "Produce a concise, relevant skills list as bullets, grouped only if the input implies natural groupings.",
  education:
    "Write a clean one-line education entry (degree, institution, year) from the input.",
};

const BUILDER_SYSTEM_PROMPT = `You are helping a job seeker draft their resume. Ground everything in the
facts they give you — never fabricate employers, titles, dates, or metrics that weren't provided.
If the input is too thin to write a good section, say so in "content" rather than padding with
generic language.`;

/** Generates a single resume section from the user's raw notes for that section. */
export async function generateBuilderSection(
  section: BuilderSectionType,
  userInput: string,
  jobDescription?: string
): Promise<BuilderSection> {
  const prompt = [
    `Section: ${section}`,
    `Guidance: ${SECTION_GUIDANCE[section]}`,
    jobDescription ? `Target job description:\n${jobDescription}` : null,
    `User's raw notes for this section:\n${userInput}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return runStructured({
    system: BUILDER_SYSTEM_PROMPT,
    prompt,
    toolName: "submit_resume_section",
    toolDescription:
      "Submit the drafted resume section content, plus individual bullets when the section is bulleted.",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description:
            "The full drafted section as plain text (bullets joined with newlines where applicable).",
        },
        bullets: {
          type: "array",
          items: { type: "string" },
          description: "Individual bullet points, when the section is bulleted (experience, skills).",
        },
      },
      required: ["content"],
    },
    schema: builderSectionSchema,
    maxTokens: 1024,
  });
}
