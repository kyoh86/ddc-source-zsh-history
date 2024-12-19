import {
  type ActionArguments,
  ActionFlags,
  type ActionResult,
  type Actions,
} from "jsr:@shougo/ddu-vim@~9.1.0/types";
import { BaseKind } from "jsr:@shougo/ddu-vim@~9.1.0/kind";
import * as fn from "jsr:@denops/std@~7.4.0/function";
import * as vars from "jsr:@denops/std@~7.4.0/variable";

import type { Entry } from "../zsh-history/types.ts";

export type ActionData = Entry;

type Params = Record<PropertyKey, never>;

export class Kind extends BaseKind<Params> {
  override actions: Actions<Params> = {
    yank: async (
      { denops, items }: ActionArguments<Params>,
    ): Promise<ActionFlags | ActionResult> => {
      const text = items.map((item) => {
        const action = item.action as ActionData;
        return action.command;
      }).filter((value) => !!value).join("\n");

      await fn.setreg(denops, '"', text, "v");
      await fn.setreg(denops, await vars.v.get(denops, "register"), text, "v");
      return ActionFlags.None;
    },
    append: async (
      args: ActionArguments<Params>,
    ): Promise<ActionFlags | ActionResult> => await put(args, true),
    insert: async (
      args: ActionArguments<Params>,
    ): Promise<ActionFlags | ActionResult> => await put(args, false),
  };

  params(): Params {
    return {};
  }
}

/**
 * Puts the formatted issue after the cursor.
 * @param after If true, put text after the cursor
 * @param {ActionArguments<T>} obj The arguments for the action.
 * @param {Denops} obj.denops The Denops instance to interact with Vim/Neovim.
 * @param {DduItem[]} obj.items The items to act on.
 * @returns The result of the action.
 */
async function put(
  { denops, items }: ActionArguments<Params>,
  after: boolean,
): Promise<ActionFlags | ActionResult> {
  let nl = "";
  for (const item of items) {
    const action = item.action as ActionData;
    const value = action.command;
    if (!value) {
      continue;
    }

    // Save the current state of the register
    const reginfo = await fn.getreginfo(denops, '"');
    // Paste the text at the appropriate position
    await fn.setreg(denops, '"', `${nl}${value}`, "c");
    await denops.cmd(after ? "normal! p" : "normal! P");
    // Restore the register's original content
    await fn.setreg(denops, '"', reginfo.regcontents, reginfo.regtype);
    nl = "\n";
  }
  return ActionFlags.None;
}
