import { runStructured } from "@/lib/ai/client";
import { parsedJobSchema, type ParsedJob } from "@/lib/ai/schemas";

const JOB_PARSER_SYSTEM_PROMPT = `You extract the structure of a job posting so a resume can be
matched against it. Only include what the posting actually says — never invent requirements.
Split compound requirements into separate, individually checkable items ("5+ years of React
and TypeScript" becomes two). Mark an item "preferred" only when the posting signals it is
optional ("nice to have", "bonus", "preferred", "plus"); otherwise "required". Skip benefits,
company boilerplate, and EEO statements.`;

/** Parses a raw job description into title, company, and checkable requirements. */
export async function parseJobDescription(description: string): Promise<ParsedJob> {
  return runStructured({
    system: JOB_PARSER_SYSTEM_PROMPT,
    prompt: `Extract the structure of this job posting.\n\n--- JOB POSTING ---\n${description}`,
    toolName: "submit_parsed_job",
    toolDescription:
      "Submit the parsed job posting: title, company, seniority, individual requirements, and keywords.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "The job title. Use 'Untitled role' if none is stated." },
        company: { type: ["string", "null"], description: "Company name, or null if not stated." },
        seniority: {
          type: ["string", "null"],
          description: "Seniority level (e.g. 'Junior', 'Senior', 'Staff'), or null if not stated.",
        },
        requirements: {
          type: "array",
          maxItems: 25,
          items: {
            type: "object",
            properties: {
              text: { type: "string", description: "One individually checkable requirement." },
              importance: { type: "string", enum: ["required", "preferred"] },
              category: { type: "string", enum: ["skill", "experience", "education", "other"] },
            },
            required: ["text", "importance", "category"],
          },
          description: "The posting's requirements, most important first. At most 25.",
        },
        keywords: {
          type: "array",
          items: { type: "string" },
          description: "Distinctive terms an ATS would likely scan for (tools, methods, certifications).",
        },
      },
      required: ["title", "company", "seniority", "requirements", "keywords"],
    },
    schema: parsedJobSchema,
  });
}
