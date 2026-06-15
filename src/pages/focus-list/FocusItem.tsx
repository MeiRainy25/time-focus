import dayjs from "dayjs";
import { BookOpen, Code2 } from "lucide-react";
import type { FocusType } from "@/types/focus";

type FocusItemProps = {
  createdAt: number;
  durationSeconds: number;
  name: string;
  type: FocusType;
};

const iconMap = {
  code: Code2,
  study: BookOpen,
} satisfies Record<FocusType, typeof Code2>;

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds} 秒`;
  }

  if (seconds === 0) {
    return `${minutes} 分钟`;
  }

  return `${minutes} 分 ${seconds} 秒`;
}

export function FocusItem({
  createdAt,
  durationSeconds,
  name,
  type,
}: FocusItemProps) {
  const Icon = iconMap[type];

  return (
    <article className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="grid size-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="truncate text-base font-medium">{name}</h2>
          <time className="text-xs text-muted-foreground">
            {dayjs(createdAt).format("YYYY-MM-DD HH:mm")}
          </time>
        </div>
        <p className="text-sm text-muted-foreground">
          专注时长：{formatDuration(durationSeconds)}
        </p>
      </div>
    </article>
  );
}
