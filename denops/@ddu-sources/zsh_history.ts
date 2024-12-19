import type { Item } from "jsr:@shougo/ddu-vim@~9.1.0/types";
import { BaseSource } from "jsr:@shougo/ddu-vim@~9.1.0/source";

import { parseZshHistory } from "../zsh-history/parser.ts";
import type { ActionData } from "../@ddu-kinds/zsh_history.ts";

type Params = {
  historyPath?: string;
};

export class Source extends BaseSource<Params, ActionData> {
  override kind = "zsh_history";

  override gather(args: { sourceParams: Params }) {
    return new ReadableStream<Item<ActionData>[]>({
      async start(controller) {
        const historyPath = args.sourceParams.historyPath ??
          `${Deno.env.get("HOME")}/.zsh_history`;

        let entries: ActionData[];
        try {
          entries = await parseZshHistory(historyPath);
        } catch (e) {
          console.error(`Failed to parse history file: ${e}`);
          return;
        }

        controller.enqueue(entries.map((entry) => ({
          word: entry.command,
          action: entry,
        })));
        controller.close();
      },
    });
  }

  override params(): Params {
    return {};
  }
}
