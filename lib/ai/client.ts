import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";

export const CLAUDE_MODEL = "claude-sonnet-5";

let client: Anthropic | undefined;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export class AiResponseValidationError extends Error {
  constructor(cause: unknown) {
    super("Claude's structured response failed schema validation");
    this.cause = cause;
  }
}

/**
 * Calls Claude with a single forced tool call so the response is
 * structured JSON, then validates it against `schema`. Retries once with
 * the validation error appended to the prompt, since occasional malformed
 * output is expected from any LLM and shouldn't surface as a hard failure.
 */
export async function runStructured<T extends z.ZodTypeAny>({
  system,
  prompt,
  toolName,
  toolDescription,
  inputSchema,
  schema,
  maxTokens = 2048,
}: {
  system: string;
  prompt: string;
  toolName: string;
  toolDescription: string;
  inputSchema: Anthropic.Tool.InputSchema;
  schema: T;
  maxTokens?: number;
}): Promise<z.infer<T>> {
  const anthropic = getClient();
  const tool: Anthropic.Tool = {
    name: toolName,
    description: toolDescription,
    input_schema: inputSchema,
  };

  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system,
      tools: [tool],
      tool_choice: { type: "tool", name: toolName },
      messages: [
        {
          role: "user",
          content:
            attempt === 0
              ? prompt
              : `${prompt}\n\nYour previous response failed validation: ${String(
                  lastError
                )}. Fix it and call the tool again.`,
        },
      ],
    });

    const toolUse = message.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );

    if (!toolUse) {
      lastError = "model did not call the required tool";
      continue;
    }

    const parsed = schema.safeParse(toolUse.input);
    if (parsed.success) {
      return parsed.data;
    }
    lastError = parsed.error;
  }

  throw new AiResponseValidationError(lastError);
}
