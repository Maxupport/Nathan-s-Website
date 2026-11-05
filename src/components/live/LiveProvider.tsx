"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  demoSongs,
  initialShows,
  generate,
  type Song,
  type Show,
  type Submission,
} from "@/lib/live/model";
import { changesSince, type AdminState } from "@/lib/live/admin-state";

type Store = {
  intakeEnabled: boolean;
  preview: boolean;
  managed: boolean;
  loaded: boolean;
  saving: boolean;
  dirty: boolean;
  syncMessage: string;
  refreshAdmin: (discard?: boolean) => Promise<void>;
  saveAdmin: () => Promise<void>;
  songs: Song[];
  setSongs: Dispatch<SetStateAction<Song[]>>;
  shows: Show[];
  setShows: Dispatch<SetStateAction<Show[]>>;
  submissions: Submission[];
  setSubmissions: Dispatch<SetStateAction<Submission[]>>;
};
const Context = createContext<Store | null>(null);
export default function LiveProvider({
  children,
  intakeEnabled = false,
  managed = false,
  preview = true,
}: {
  children: React.ReactNode;
  intakeEnabled?: boolean;
  managed?: boolean;
  preview?: boolean;
}) {
  const [songs, rawSetSongs] = useState<Song[]>(managed ? [] : demoSongs);
  const [shows, rawSetShows] = useState<Show[]>(managed ? [] : initialShows);
  const [submissions, rawSetSubmissions] = useState<Submission[]>([]);
  const [baseline, setBaseline] = useState<AdminState | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const edits = useRef(0);
  const refreshing = useRef(false);
  const savingNow = useRef(false);
  const setSongs: Store["setSongs"] = (value) => {
    edits.current++;
    rawSetSongs(value);
  };
  const setShows: Store["setShows"] = (value) => {
    edits.current++;
    rawSetShows(value);
  };
  const setSubmissions: Store["setSubmissions"] = (value) => {
    edits.current++;
    rawSetSubmissions(value);
  };
  const changes = baseline
    ? changesSince(baseline, { songs, shows, submissions })
    : null;
  const dirty = Boolean(
    changes &&
    (changes.songs.length || changes.shows || changes.submissions.length),
  );
  async function refreshAdmin(discard = false) {
    if (!managed || refreshing.current || savingNow.current) return;
    refreshing.current = true;
    const version = edits.current;
    try {
      const response = await fetch("/api/live/admin/state", {
        cache: "no-store",
        credentials: "same-origin",
        signal: AbortSignal.timeout(30000),
      });
      if (response.status === 401) {
        setSyncMessage("登入已過期，請重新登入。");
        rawSetSubmissions([]);
        rawSetSongs([]);
        rawSetShows([]);
        setBaseline(null);
        location.replace("/live/admin");
        return;
      }
      if (!response.ok) throw new Error();
      const data: AdminState = await response.json();
      if ((dirty && !discard) || version !== edits.current) {
        // Preserve staged edits; append newly arrived interactions without dropping them.
        rawSetSubmissions((old) => [
          ...data.submissions.filter(
            (s) =>
              !old.some((o) => o.id === s.id) &&
              !baseline?.submissions.some((o) => o.id === s.id),
          ),
          ...old,
        ]);
        setBaseline((old) =>
          old
            ? {
                ...old,
                submissions: [
                  ...old.submissions,
                  ...data.submissions.filter(
                    (s) => !old.submissions.some((o) => o.id === s.id),
                  ),
                ],
              }
            : old,
        );
        setSyncMessage(
          "有尚未儲存的修改；新留言持續更新，歌庫與場次待儲存或重新載入。",
        );
        return;
      }
      setBaseline(data);
      rawSetSongs(data.songs);
      rawSetShows(
        data.shows.length
          ? data.shows
          : initialShows().map((s, index) => ({
              ...s,
              items: generate(
                [
                  ...data.songs.slice(index * 3),
                  ...data.songs.slice(0, index * 3),
                ],
                "oldies",
                "",
                [],
                () => 0.5,
              ),
            })),
      );
      rawSetSubmissions(data.submissions);
      setSyncMessage(
        `已同步 Google Sheet · ${new Date().toLocaleTimeString("zh-TW", { hour12: false })}`,
      );
    } catch {
      setSyncMessage("無法更新 Google Sheet，保留目前畫面，稍後會再試。");
    } finally {
      refreshing.current = false;
    }
  }
  async function saveAdmin() {
    if (!managed || !baseline || !changes || savingNow.current) return;
    savingNow.current = true;
    setSaving(true);
    const snapshot = { songs, shows, submissions };
    try {
      const response = await fetch("/api/live/admin/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revision: baseline.revision, changes }),
        credentials: "same-origin",
        signal: AbortSignal.timeout(30000),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) {
        setSyncMessage(result?.error ?? "尚未確認保存，請重新載入檢查。");
        return;
      }
      setBaseline({ ...snapshot, revision: result.revision });
      setSyncMessage("已確認保存至 Google Sheet。");
    } catch {
      setSyncMessage("尚未確認完整保存，請保留畫面並重新載入檢查後再操作。");
    } finally {
      savingNow.current = false;
      setSaving(false);
    }
  }
  return (
    <Context.Provider
      value={{
        intakeEnabled,
        preview,
        managed,
        loaded: !managed || Boolean(baseline),
        saving,
        dirty,
        syncMessage,
        refreshAdmin,
        saveAdmin,
        songs,
        setSongs,
        shows,
        setShows,
        submissions,
        setSubmissions,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useLive() {
  const value = useContext(Context);
  if (!value) throw new Error("LiveProvider is required");
  return value;
}
