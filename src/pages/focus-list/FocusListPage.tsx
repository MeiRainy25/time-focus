import { useEffect, useState } from "react";
import { getAllIndexedDbItems } from "@/lib/indexed-db";
import type { FocusRecord } from "@/types/focus";
import { FocusItem } from "./FocusItem";

function sortRecords(records: FocusRecord[]) {
  return records.toSorted((first, second) => second.createdAt - first.createdAt);
}

export function FocusListPage() {
  const [records, setRecords] = useState<FocusRecord[]>([]);

  useEffect(() => {
    let ignore = false;

    async function loadRecords() {
      const indexedDbRecords = await getAllIndexedDbItems<FocusRecord>();

      if (!ignore) {
        setRecords(sortRecords(indexedDbRecords));
      }
    }

    void loadRecords();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Focus List</p>
        <h1 className="text-2xl font-semibold tracking-tight">专注记录</h1>
      </div>

      {records.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          暂无专注记录，完成一次专注后会显示在这里。
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {records.map((record) => (
            <FocusItem
              createdAt={record.createdAt}
              durationSeconds={record.durationSeconds}
              key={record.id}
              name={record.name}
              type={record.type}
            />
          ))}
        </div>
      )}
    </div>
  );
}
