import { useEffect, useMemo, useState } from "react";
import { Button } from "@/component/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/ui/select";
import { getPagedIndexedDbItems } from "@/lib/indexed-db";
import type { FocusRecord, FocusType } from "@/types/focus";
import { FocusItem } from "./FocusItem";

const PAGE_SIZE = 10;
const TYPE_CREATED_AT_INDEX = "type-createdAt";

type FocusTypeFilter = FocusType | "all";

function createFocusTypeQuery(focusTypeFilter: FocusTypeFilter) {
  if (focusTypeFilter === "all") {
    return null;
  }

  return IDBKeyRange.bound(
    [focusTypeFilter],
    [focusTypeFilter, Number.MAX_SAFE_INTEGER],
  );
}

function createPagedQueryOptions(focusTypeFilter: FocusTypeFilter, page: number) {
  return {
    indexName:
      focusTypeFilter === "all" ? undefined : TYPE_CREATED_AT_INDEX,
    page,
    pageSize: PAGE_SIZE,
    query: createFocusTypeQuery(focusTypeFilter),
  };
}

export function FocusListPage() {
  const [focusTypeFilter, setFocusTypeFilter] =
    useState<FocusTypeFilter>("all");
  const [records, setRecords] = useState<FocusRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreRecords, setHasMoreRecords] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const selectedFilterLabel = useMemo(() => {
    if (focusTypeFilter === "code") {
      return "代码";
    }

    if (focusTypeFilter === "study") {
      return "学习";
    }

    return "全部";
  }, [focusTypeFilter]);

  useEffect(() => {
    let ignore = false;

    async function loadRecords() {
      setIsLoading(true);
      setCurrentPage(1);
      setRecords([]);

      const indexedDbRecords = await getPagedIndexedDbItems<FocusRecord>(
        createPagedQueryOptions(focusTypeFilter, 1),
      );

      if (!ignore) {
        setRecords(indexedDbRecords);
        setHasMoreRecords(indexedDbRecords.length === PAGE_SIZE);
        setIsLoading(false);
      }
    }

    void loadRecords();

    return () => {
      ignore = true;
    };
  }, [focusTypeFilter]);

  async function handleLoadMore() {
    const nextPage = currentPage + 1;

    setIsLoading(true);

    const indexedDbRecords = await getPagedIndexedDbItems<FocusRecord>(
      createPagedQueryOptions(focusTypeFilter, nextPage),
    );

    setRecords((currentRecords) => [...currentRecords, ...indexedDbRecords]);
    setCurrentPage(nextPage);
    setHasMoreRecords(indexedDbRecords.length === PAGE_SIZE);
    setIsLoading(false);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Focus List
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">专注记录</h1>
        </div>

        <label className="flex flex-col gap-2 sm:w-40">
          <span className="text-sm font-medium text-muted-foreground">
            专注类型
          </span>
          <Select
            onValueChange={(value: FocusTypeFilter) =>
              setFocusTypeFilter(value)
            }
            value={focusTypeFilter}
          >
            <SelectTrigger className="w-full">
              <SelectValue>{selectedFilterLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="code">代码</SelectItem>
              <SelectItem value="study">学习</SelectItem>
            </SelectContent>
          </Select>
        </label>
      </div>

      {records.length === 0 && !isLoading ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          暂无{selectedFilterLabel}专注记录。
        </div>
      ) : (
        <>
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

          {hasMoreRecords ? (
            <Button
              className="self-center"
              disabled={isLoading}
              onClick={handleLoadMore}
              type="button"
              variant="outline"
            >
              {isLoading ? "加载中..." : "加载更多"}
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
}
