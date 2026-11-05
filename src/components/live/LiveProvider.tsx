"use client";

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  demoSongs,
  initialShows,
  type Song,
  type Show,
  type Submission,
} from "@/lib/live/model";

type Store = {
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
}: {
  children: React.ReactNode;
}) {
  const [songs, setSongs] = useState(demoSongs);
  const [shows, setShows] = useState(initialShows);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  return (
    <Context.Provider
      value={{ songs, setSongs, shows, setShows, submissions, setSubmissions }}
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
