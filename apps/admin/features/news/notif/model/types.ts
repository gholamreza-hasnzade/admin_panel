export type { SelectOption } from "@/lib/select-options";

export type { NotifFormValues } from "./form-schema";

export type NotifItem = {
  id: number;
  title: string | null;
  shortText: string | null;
  longText: string | null;
  startDate: string | null;
  endDate: string | null;
  pStartDate: string | null;
  pEndDate: string | null;
  creator: string | null;
  visible: boolean | null;
  viewSide: number | null;
  viewSideTitle: string | null;
  userType: number | null;
  userTypeTitle: string | null;
  deleted: boolean | null;
  orderIndex: number | null;
};
