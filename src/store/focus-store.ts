import { create } from "zustand";
import type { FocusType } from "@/types/focus";

type FocusStore = {
  focusName: string;
  focusType: FocusType;
  setFocusName: (focusName: string) => void;
  setFocusType: (focusType: FocusType) => void;
};

export const useFocusStore = create<FocusStore>((set) => ({
  focusName: "",
  focusType: "code",
  setFocusName: (focusName) => set({ focusName }),
  setFocusType: (focusType) => set({ focusType }),
}));
