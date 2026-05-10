export type { SelectOption } from "@/lib/select-options";

export type { SliderFormValues } from "./form-schema";

export type SliderItem = {
  id: number;
  title: string | null;
  subTitle: string | null;
  imageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  pStartDate: string | null;
  pEndDate: string | null;
  width: number | null;
  height: number | null;
  viewTypeTitle?: number | null;
  userTypeTitle?: number | null;
  viewType: number | null;
  userType: number | null;
  href: string | null;
  orderIndex: number | null;
};
