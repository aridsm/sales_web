"use client";

import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PaginationResult } from "../utils/usePagination";
import {
  KeyboardArrowRight,
  Search,
  DeleteOutlined,
  Add,
  SearchOffOutlined,
} from "@mui/icons-material";
import AppPagination from "./AppPagination";
import AppInputText from "./inputs/AppInputText";
import AppButton from "./AppButton";
import AppLoading from "./AppLoading";
import { useDialogStore } from "@/stores/dialogStore";
import { useTranslation } from "@/app/utils/i18n";

interface AppGroupProps<G extends { id: string | number }, T> {
  groups: PaginationResult<G>;
  renderGroupName?: (group: G) => React.ReactNode;
  onNew?: () => void;
  onNewRow?: (props: { group: G }) => void;
  onDelete?: () => void;
  filter?: React.ReactNode;
  search?: boolean;
  hideSelectionCount?: boolean;
  selectedItems?: T[];
  children: ({
    group,
    search,
  }: {
    group: G;
    search?: string;
  }) => React.ReactNode;
}

function GroupRow<G extends { id: string | number }>({
  group,
  renderGroupName,
  onNewRow,
  search,
  children,
}: {
  group: G;
  renderGroupName?: (group: G) => React.ReactNode;
  onNewRow?: (props: { group: G }) => void;
  search?: string;
  children: ({
    group,
    search,
  }: {
    group: G;
    search?: string;
  }) => React.ReactNode;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [hasBeenOpened, setHasBeenOpened] = React.useState(false);

  React.useEffect(() => {
    if (open) setHasBeenOpened(true);
  }, [open]);

  const label = renderGroupName ? renderGroupName(group) : String(group);

  return (
    <div
      className={`border border-border transition overflow-hidden rounded-md shrink-0 ${open ? "border-primary/50 dark:border-primary" : "hover:border-border-2"}`}
    >
      <div
        className={`group w-full flex items-center  transition-colors ${open ? "bg-primary-light hover:bg-primary-light" : " bg-background-2 dark:bg-background-3 dark:hover:bg-background-2"}`}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex-1 flex items-center gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
        >
          <span
            className={`transition-all duration-200 shrink-0 ${open ? "-rotate-90" : ""}`}
          >
            <KeyboardArrowRight fontSize="small" />
          </span>
          <span className="flex-1 text-foreground">{label}</span>
        </button>
        {onNewRow && (
          <div className="px-4 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <AppButton
              type="button"
              flat
              color="transparent"
              className="w-7 h-7 rounded-full! hover:bg-foreground/5!"
              onClick={(e) => {
                e.stopPropagation();
                onNewRow?.({ group });
              }}
              title={t("labels.grid.add_item")}
            >
              <Add fontSize="small" />
            </AppButton>
          </div>
        )}
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          {hasBeenOpened && (
            <div className="px-3 pb-3 flex flex-col gap-2 min-h-0 border-t border-primary/50 dark:border-primary">
              {children({ group, search })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AppGroup<G extends { id: string | number }, T>({
  groups,
  renderGroupName,
  onNew,
  onNewRow,
  onDelete,
  filter,
  search,
  selectedItems,
  hideSelectionCount,
  children,
}: AppGroupProps<G, T>) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { openDialog } = useDialogStore();

  const hasSelection = selectedItems !== undefined && !!selectedItems.length;

  const [searchInput, setSearchInput] = React.useState(
    () => searchParams.get("search") || "",
  );

  const [delayedLoading, setDelayedLoading] = React.useState(false);
  const [hasStartedLoading, setHasStartedLoading] = React.useState(false);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;

    if (groups.loading) {
      setHasStartedLoading(true);
      timer = setTimeout(() => {
        setDelayedLoading(true);
      }, 300);
    } else {
      setDelayedLoading(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [groups.loading]);

  React.useEffect(() => {
    setSearchInput(searchParams.get("search") || "");
  }, [searchParams]);

  function handleSearch() {
    try {
      const newParams = new URLSearchParams(searchParams.toString());
      if (searchInput) {
        newParams.set("search", searchInput);
      } else {
        newParams.delete("search");
      }
      newParams.set("page", "1");
      router.push(`${pathname}?${newParams.toString()}`);
      groups.load({ params: { search: searchInput, page: 1 } });
    } catch (error) {
      openDialog({
        variant: "error",
        message: t("labels.grid.search_error"),
      });
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 flex-1 w-full gap-3">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {search && (
          <div className="relative w-full sm:max-w-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
              <Search fontSize="small" />
            </div>
            <AppInputText
              type="text"
              className="pl-10!"
              placeholder={t("labels.grid.search_placeholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onBlur={handleSearch}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto ml-auto">
          {hasSelection &&
            !!selectedItems &&
            selectedItems.length > 0 &&
            !hideSelectionCount && (
              <span className="font-medium text-sm whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-200">
                {selectedItems.length}{" "}
                {selectedItems.length === 1
                  ? t("labels.grid.item_selected_singular")
                  : t("labels.grid.item_selected_plural")}
              </span>
            )}
          <div className="flex gap-3 w-full sm:w-auto">
            {hasSelection &&
              !!selectedItems &&
              selectedItems.length > 0 &&
              onDelete && (
                <AppButton
                  color="red"
                  onClick={onDelete}
                  className="px-4 shrink-0 w-full sm:w-auto"
                >
                  <DeleteOutlined fontSize="small" />
                  {t("labels.all.delete")}
                </AppButton>
              )}
            {filter}

            {onNew && (
              <AppButton
                color="primary"
                onClick={() => onNew?.()}
                className="px-4 py-2 shrink-0 w-full sm:w-auto"
              >
                <Add fontSize="small" />
                {t("labels.grid.add_item")}
              </AppButton>
            )}
          </div>
        </div>
      </div>
      <div
        className={`flex flex-col gap-2 min-h-0 flex-1 overflow-auto ${delayedLoading ? "opacity-50 transition-opacity pointer-events-none" : ""}`}
      >
        {groups.items.length === 0 ? (
          !hasStartedLoading || groups.loading ? (
            delayedLoading ? (
              <div className="flex justify-center items-center h-full">
                <AppLoading className="p-10" />
              </div>
            ) : (
              <div className="py-10" />
            )
          ) : (
            <div className="flex flex-col rounded-md items-center justify-center py-12 px-4 text-label">
              <div className="w-10 h-10 text-primary dark:text-primary-2 mb-4 rounded-full bg-primary-light flex items-center justify-center">
                <SearchOffOutlined fontSize="medium" />
              </div>
              <p className="text-base font-medium text-foreground">
                {t("labels.grid.no_result_title")}
              </p>
              <p className="text-sm text-center mt-1 max-w-xs">
                {t("labels.grid.no_result_subtitle")}
              </p>
            </div>
          )
        ) : (
          groups.items.map((group) => {
            return (
              <GroupRow<G>
                key={group.id}
                group={group}
                renderGroupName={renderGroupName}
                onNewRow={onNewRow}
                search={searchInput}
              >
                {children}
              </GroupRow>
            );
          })
        )}
      </div>

      <AppPagination pagination={groups} />
    </div>
  );
}
