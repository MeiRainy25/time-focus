export type FocusType = "code" | "study";

export type FocusRecord = {
  createdAt: number;
  durationSeconds: number;
  id: string;
  name: string;
  type: FocusType;
};
