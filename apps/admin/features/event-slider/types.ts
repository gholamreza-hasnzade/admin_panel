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

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SliderFormValues = {
  title: string;
  subTitle: string;
  imageUrl: string;
  href: string;
  startDate: string;
  endDate: string;
  width: string;
  height: string;
  viewType: string;
  userType: string;
  orderIndex: string;
};

export type SliderFormErrors = Partial<Record<keyof SliderFormValues, string>>;
