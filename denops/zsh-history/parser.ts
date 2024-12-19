import { unmetafy } from "./unmetafier.ts";
import type { Entry } from "./types.ts";

export async function parseZshHistory(filePath: string): Promise<Entry[]> {
  const entries: Entry[] = [];

  try {
    const decoder = new TextDecoder("utf-8");
    const data = await Deno.readFile(filePath);
    const text = decoder.decode(data);
    const lines = text.split("\n");

    let buffer = "";
    let lastLineContinuation = false;

    for (const line of lines) {
      // 行継続の処理
      if (lastLineContinuation) {
        buffer += "\n" + line;
      } else {
        buffer = line;
      }

      lastLineContinuation = line.endsWith("\\");

      if (!lastLineContinuation) {
        const entry = parseEntry(buffer);
        if (entry) {
          entries.push(entry);
        }
        buffer = "";
      }
    }
  } catch (error) {
    console.error(`Failed to read history file from ${filePath}: ${error}`);
  }

  return entries;
}
function parseEntry(text: string): Entry | null {
  if (!text.startsWith(": ")) {
    return null;
  }

  const line = text.slice(2);
  const [metadata, commandWithMeta] = line.split(";", 2);
  if (!metadata || !commandWithMeta) {
    return null;
  }

  const [timeStr, durationStr] = metadata.split(":");
  const time = parseInt(timeStr, 10);
  const duration = parseInt(durationStr, 10);
  if (isNaN(time) || isNaN(duration)) {
    return null;
  }

  const command = unmetafy(commandWithMeta);
  return {
    time: new Date(time * 1000),
    duration,
    command,
  };
}
