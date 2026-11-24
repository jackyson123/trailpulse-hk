"use client";

import { dict } from "@/lib/i18n";
import { GROUP_LABEL } from "@/lib/checklist";
import type { ChecklistItem, Lang } from "@/lib/types";
import { BackpackIcon, CheckIcon, DropletIcon, ShieldIcon, ShirtIcon } from "./icons";

const GROUP_ICON = {
  water: DropletIcon,
  wear: ShirtIcon,
  gear: BackpackIcon,
  safety: ShieldIcon,
};

export default function Checklist({
  items,
  lang,
  checked,
  onToggle,
  onReset,
}: {
  items: ChecklistItem[];
  lang: Lang;
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
  onReset: () => void;
}) {
  const c = dict[lang];
  const done = items.filter((item) => checked[item.id]).length;
  const groups = ["water", "wear", "gear", "safety"] as const;

  return (
    <section className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-[13px] font-bold text-forest">{c.checklist}</h3>
          <p className="mt-0.5 text-[10px] text-ink/45">{c.checklistHint}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="num text-[11px] font-semibold text-ink/60">
            {done}/{items.length} {c.packed}
          </span>
          <button type="button" onClick={onReset} className="text-[10px] font-medium text-ink/45 underline decoration-line underline-offset-2 hover:text-forest">
            {c.resetChecklist}
          </button>
        </div>
      </div>

      <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-sand">
        <div className="h-full rounded-full bg-forest transition-all duration-500" style={{ width: `${(done / Math.max(1, items.length)) * 100}%` }} />
      </div>

      <div className="mt-4 sm:columns-2 sm:gap-x-6">
        {groups.map((group) => {
          const list = items.filter((item) => item.group === group);
          if (!list.length) return null;
          const Icon = GROUP_ICON[group];
          return (
            <div key={group} className="mb-4 break-inside-avoid">
              <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45">
                <Icon className="h-3.5 w-3.5 text-forest/50" />
                {GROUP_LABEL[group][lang]}
              </p>
              <ul className="space-y-1">
                {list.map((item) => {
                  const isChecked = !!checked[item.id];
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onToggle(item.id)}
                        data-testid="check-item"
                        aria-pressed={isChecked}
                        className={`flex w-full items-start gap-2 rounded-lg px-1.5 py-1.5 text-left transition hover:bg-sand/60 ${
                          item.essential ? "bg-amber/[0.045]" : ""
                        }`}
                      >
                        <span
                          className={`mt-[1px] grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border transition ${
                            isChecked ? "border-forest bg-forest text-paper" : "border-line bg-white text-transparent"
                          }`}
                        >
                          <CheckIcon className="h-2.5 w-2.5" strokeWidth={2.6} />
                        </span>
                        <span className="min-w-0">
                          <span className={`block text-[11.5px] font-medium leading-tight ${isChecked ? "text-ink/40 line-through" : "text-ink/85"}`}>
                            {item.label[lang]}
                          </span>
                          <span className="mt-0.5 block text-[10px] leading-snug text-ink/45">{item.reason[lang]}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
