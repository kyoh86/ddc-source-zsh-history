import { BaseSource } from "jsr:@shougo/ddc-vim@~9.1.0/source";
import type { Item } from "jsr:@shougo/ddc-vim@~9.1.0/types";

import { parseZshHistory } from "../zsh-history/parser.ts";
import type { Entry } from "../zsh-history/types.ts";

type Params = {
  historyPath?: string;
  maxSize?: number;
};

export class Source extends BaseSource<Params> {
  override async gather(args: { sourceParams: Params }): Promise<Item[]> {
    const historyPath = args.sourceParams.historyPath ??
      `${Deno.env.get("HOME")}/.zsh_history`;
    const maxSize = args.sourceParams.maxSize ?? 1000;

    let entries: Entry[];
    try {
      entries = await parseZshHistory(historyPath);
    } catch (e) {
      console.error(`Failed to parse history file: ${e}`);
      return [];
    }

    // 最新のエントリから指定された数だけ取得
    entries = entries.slice(-maxSize).reverse();

    const candidates: Item[] = entries.map((entry) => ({
      word: entry.command,
      info: `Time: ${entry.time.toLocaleString()}`,
    }));

    return candidates;
  }

  override params(): Params {
    return {};
  }
}

export default Source;
