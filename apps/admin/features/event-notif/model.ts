import { z } from "zod";
import { toBackendDateTimeTimestamp } from "@repo/ui";

import type { EventNotifFormValues } from "./types";

export const EMPTY_EVENT_NOTIF_FORM: EventNotifFormValues = {
  title: "",
  shortText: "",
  longText: "",
  startDate: "",
  endDate: "",
  creator: "",
  visible: "true",
  viewSide: "",
  userType: "",
  orderIndex: "",
};

export const eventNotifFormSchema = z
  .object({
    title: z.string().trim().min(1, "عنوان الزامی است."),
    shortText: z.string().trim().min(1, "متن کوتاه الزامی است."),
    longText: z.string().trim().min(1, "متن کامل الزامی است."),
    startDate: z.string().trim().min(1, "تاریخ شروع الزامی است."),
    endDate: z.string().trim().min(1, "تاریخ پایان الزامی است."),
    creator: z.string().optional(),
    visible: z.string().trim().min(1, "وضعیت نمایش الزامی است."),
    viewSide: z.string().trim().min(1, "سمت نمایش را انتخاب کنید."),
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

    const normalizedViewSide = values.viewSide.trim();
    const parsedViewSide = Number(normalizedViewSide);
    if (
      !normalizedViewSide ||
      !Number.isInteger(parsedViewSide) ||
      parsedViewSide < 0 ||
      parsedViewSide > 255
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["viewSide"],
        message: "سمت نمایش باید عدد صحیح بین 0 تا 255 باشد.",
      });
    }
  });
