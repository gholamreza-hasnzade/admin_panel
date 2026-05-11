import { z } from "zod";
import { toBackendDateTimeTimestamp } from "@repo/ui";

const MAX_SLIDER_WIDTH = 644;
const MAX_SLIDER_HEIGHT = 120;

export const sliderFormSchema = z
  .object({
    title: z.string().trim().min(1, "عنوان الزامی است."),
    subTitle: z.string().optional(),
    imageUrl: z.string().trim().min(1, "آدرس تصویر الزامی است."),
    href: z.string().optional(),
    startDate: z.string().trim().min(1, "تاریخ شروع الزامی است."),
    endDate: z.string().trim().min(1, "تاریخ پایان الزامی است."),
    width: z.string().trim().min(1, "عرض الزامی است."),
    height: z.string().trim().min(1, "ارتفاع الزامی است."),
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

    const widthValue = values.width?.trim();
    if (widthValue) {
      const width = Number(widthValue);
      if (!Number.isInteger(width) || width < 1 || width > MAX_SLIDER_WIDTH) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["width"],
          message: `عرض باید عدد صحیح بین 1 تا ${MAX_SLIDER_WIDTH} باشد.`,
        });
      }
    }

    const heightValue = values.height?.trim();
    if (heightValue) {
      const height = Number(heightValue);
      if (!Number.isInteger(height) || height < 1 || height > MAX_SLIDER_HEIGHT) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["height"],
          message: `ارتفاع باید عدد صحیح بین 1 تا ${MAX_SLIDER_HEIGHT} باشد.`,
        });
      }
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
