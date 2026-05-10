import { z } from "zod";
import { toBackendDateTimeTimestamp } from "@repo/ui";

export const sliderFormSchema = z
  .object({
    title: z.string().trim().min(1, "عنوان الزامی است."),
    subTitle: z.string().optional(),
    imageUrl: z.string().trim().min(1, "آدرس تصویر الزامی است."),
    href: z.string().optional(),
    startDate: z.string().trim().min(1, "تاریخ شروع الزامی است."),
    endDate: z.string().trim().min(1, "تاریخ پایان الزامی است."),
    width: z.string().optional(),
    height: z.string().optional(),
    viewType: z.string().trim().min(1, "نوع نمایش را انتخاب کنید."),
    userType: z.string().trim().min(1, "نوع کاربر را انتخاب کنید."),
    orderIndex: z.string().trim().min(1, "ترتیب الزامی است."),
  })
  .superRefine((values, ctx) => {
    const startTimestamp = toBackendDateTimeTimestamp(values.startDate);
    if (startTimestamp == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "فرمت تاریخ شروع نامعتبر است.",
      });
    }

    const endTimestamp = toBackendDateTimeTimestamp(values.endDate);
    if (endTimestamp == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "فرمت تاریخ پایان نامعتبر است.",
      });
    }

    if (startTimestamp != null && endTimestamp != null && endTimestamp < startTimestamp) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "تاریخ پایان باید بعد از تاریخ شروع باشد.",
      });
    }
  });

export type SliderFormValues = z.infer<typeof sliderFormSchema>;

export const EMPTY_SLIDER_FORM: SliderFormValues = {
  title: "",
  subTitle: "",
  imageUrl: "",
  href: "",
  startDate: "",
  endDate: "",
  width: "",
  height: "",
  viewType: "",
  userType: "",
  orderIndex: "",
};
