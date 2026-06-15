import { Input } from "@/component/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/ui/select";
import type { FocusType } from "@/types/focus";
import {
  BookOpen,
  Clock3,
  Code2,
  ListChecks,
  type LucideIcon,
} from "lucide-react";

type FocusOption = {
  icon: LucideIcon;
  label: string;
  value: FocusType;
};

const focusOptions: FocusOption[] = [
  { icon: Code2, label: "代码", value: "code" },
  { icon: BookOpen, label: "学习", value: "study" },
];

type FocusFormProps = {
  durationMinutes: number;
  focusName: string;
  focusType: FocusType;
  onDurationMinutesChange: (value: number) => void;
  onFocusNameChange: (value: string) => void;
  onFocusTypeChange: (value: FocusType) => void;
};

function clampDurationMinutes(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(180, Math.max(1, Math.round(value)));
}

export function FocusForm({
  durationMinutes,
  focusName,
  focusType,
  onDurationMinutesChange,
  onFocusNameChange,
  onFocusTypeChange,
}: FocusFormProps) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <label className="flex w-full flex-col gap-2 md:w-48">
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ListChecks className="size-4" aria-hidden="true" />
            专注类型
          </span>
          <Select
            onValueChange={(value: FocusType) => onFocusTypeChange(value)}
            value={focusType}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择专注类型" />
            </SelectTrigger>
            <SelectContent position="popper">
              {focusOptions.map((option) => {
                const Icon = option.icon;

                return (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      <Icon
                        className="size-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      {option.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </label>
        <label className="flex w-full flex-col gap-2 md:w-36">
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Clock3 className="size-4" aria-hidden="true" />
            专注时长
          </span>
          <Input
            className="text-base"
            max={180}
            min={1}
            onChange={(event) =>
              onDurationMinutesChange(
                clampDurationMinutes(event.currentTarget.valueAsNumber),
              )
            }
            type="number"
            value={durationMinutes}
          />
        </label>
        <label className="flex min-w-0 flex-[1.4] flex-col gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            专注事件名称
          </span>
          <Input
            className="text-base"
            onChange={(event) => onFocusNameChange(event.target.value)}
            placeholder="例如：完成首页组件拆分"
            type="text"
            value={focusName}
          />
        </label>
      </div>
    </section>
  );
}
