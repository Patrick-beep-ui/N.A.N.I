import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Fixed, versioned instruction paths. Memory data cannot select files to inject. */
export async function behaviorInstructions() {
  const [core, context] = await Promise.all([
    readFile(join(process.cwd(), ".opencode", "nani.md"), "utf8"),
    readFile(
      join(process.cwd(), ".opencode", "skills", "nani-context", "SKILL.md"),
      "utf8",
    ),
  ]);
  return `${core}\n\n${context}`;
}
