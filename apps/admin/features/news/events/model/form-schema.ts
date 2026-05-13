import { z } from "zod";
import { toBackendDateTimeTimestamp } from "@repo/ui";

export const eventsFormSchema = z
  .object({
    title: z.string().trim().min(1, "عنوان الزامی است."),
    presenter: z.string().trim().min(1, "ارائه‌دهنده الزامی است."),
    startDate: z.string().trim().min(1, "تاریخ شروع الزامی است."),
    endDate: z.string().trim().min(1, "تاریخ پایان الزامی است."),
    status: z.string().trim().min(1, "وضعیت الزامی است."),
    visible: z.string().trim().min(1, "وضعیت نمایش الزامی است."),
    orderIndex: z.string().trim().min(1, "ترتیب الزامی است."),
  })
  .superRefine((values, ctx) => {
    const startTimestamp = toBackendDateTimeTimestamp(values.startDate);
    const endTimestamp = toBackendDateTimeTimestamp(values.endDate);

    if (startTimestamp == null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["startDate"], message: "فرمت تاریخ شروع نامعتبر است." });
    }
    if (endTimestamp == null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["endDate"], message: "فرمت تاریخ پایان نامعتبر است." });
    }
    if (startTimestamp != null && endTimestamp != null && endTimestamp < startTimestamp) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["endDate"], message: "تاریخ پایان باید بعد از تاریخ شروع باشد." });
    }
  });

export type EventsFormValues = z.infer<typeof eventsFormSchema>;

export const EMPTY_EVENTS_FORM: EventsFormValues = {
  title: "",
  presenter: "",
  startDate: "",
  endDate: "",
  status: "",
  visible: "true",
  orderIndex: "0",
};
