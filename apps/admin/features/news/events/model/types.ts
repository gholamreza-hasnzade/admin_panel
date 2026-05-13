export type { SelectOption } from "@/lib/select-options";
export type { EventsFormValues } from "./form-schema";

export type EventItem = {
  id: number;
  title: string | null;
  startDate: string | null;
  endDate: string | null;
  pStartDate: string | null;
  pEndDate: string | null;
  status: number | null;
  visible: boolean | null;
  orderIndex: number | null;
  presenter: string | null;
};
