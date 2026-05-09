# گزارش بررسی فنی پروژه MyMedu

این فایل خروجی بررسی دقیق پروژه است تا مبنای اصلاحات بعدی باشد.

## وضعیت کلی

- ساختار monorepo تمیز و قابل فهم است.
- `lint` پاس شد.
- `check-types` پاس شد.
- `build` پاس شد.
- در حال حاضر بزرگ‌ترین ریسک پروژه نبود تست خودکار و نبود CI است.

## یافته‌ها (به‌ترتیب اولویت)

### 1) بحرانی: نبود تست خودکار

**شرح مشکل**
- هیچ تست خودکاری در پروژه وجود ندارد (`test/spec` یافت نشد).
- اسکریپت تست در workspaceها تعریف نشده است.

**اثر**
- احتمال regression بالا در هر تغییر.
- سختی در refactor و توسعه ایمن.

**اقدام پیشنهادی**
- اضافه‌کردن baseline تست با Vitest + React Testing Library در `packages/ui`.
- حداقل 2 تست integration برای `DataGrid` و `FileUpload`.

---

### 2) بالا: دسترسی‌پذیری ضعیف در مرتب‌سازی `DataGrid`

**شرح مشکل**
- مرتب‌سازی با `onClick` روی `th` انجام می‌شود.
- کنترل تعاملی استاندارد (`button`)، `aria-sort` و پشتیبانی کامل کیبورد ندارد.

**اثر**
- تجربه ضعیف برای کاربران کیبورد و screen reader.
- ریسک عدم انطباق accessibility.

**اقدام پیشنهادی**
- قراردادن `button` داخل `th` برای header sortable.
- اضافه‌کردن `aria-sort`.
- پشتیبانی کامل keyboard interaction.

---

### 3) بالا: باگ حذف فایل در `FileUpload`

**وضعیت:** ✅ انجام شد

**شرح مشکل**
- حذف فایل با `file.name` انجام می‌شود.
- فایل‌های هم‌نام ممکن است اشتباه حذف شوند.

**اثر**
- خطای منطقی در رفتار upload.

**اقدام پیشنهادی**
- استفاده از کلید پایدار مانند `name + size + lastModified`.
- همسان‌سازی منطق با `MultiFileUpload`.

---

### 4) متوسط: انتخاب مجدد همان فایل در `FileUpload`

**شرح مشکل**
- بعد از `onChange` مقدار `input` ریست نمی‌شود.

**اثر**
- انتخاب مجدد همان فایل ممکن است event جدید ندهد.

**اقدام پیشنهادی**
- مشابه `MultiFileUpload`، پس از پردازش: `event.currentTarget.value = ""`.

---

### 5) متوسط: نبود CI Workflow

**شرح مشکل**
- هیچ workflow در `.github/workflows` وجود ندارد.

**اثر**
- کنترل خودکار کیفیت روی PRها انجام نمی‌شود.

**اقدام پیشنهادی**
- افزودن CI با مراحل:
  - `npm ci`
  - `npm run lint`
  - `npm run check-types`
  - `npm run build`

---

### 6) متوسط: کوپلینگ بالا در `@repo/ui`

**وضعیت:** ✅ انجام شد

**شرح مشکل**
- خروجی پکیج مستقیم از `src` اکسپورت می‌شود و build artifact ندارد.

**اثر**
- محدودیت در scalability و portability.

**اقدام پیشنهادی**
- اضافه‌کردن build برای `@repo/ui` و خروجی `dist` به همراه declaration files.

## نقاط قوت پروژه

- معماری monorepo مناسب.
- تنظیمات TypeScript خوب (`strict` و `noUncheckedIndexedAccess`).
- کیفیت پایه کامپوننت‌ها قابل قبول و reusable.
- استفاده مناسب از Turbo برای orchestration.

## چک‌لیست اصلاحات (Todo)

- [ ] اضافه‌کردن تست پایه در `packages/ui` (Vitest + RTL)
- [ ] نوشتن تست integration برای `DataGrid`
- [ ] نوشتن تست integration برای `FileUpload`
- [ ] اصلاح accessibility مرتب‌سازی `DataGrid`
- [x] اصلاح منطق حذف فایل در `FileUpload` با کلید پایدار
- [ ] ریست مقدار input در `FileUpload` بعد از انتخاب فایل
- [ ] اضافه‌کردن CI workflow برای lint/typecheck/build
- [x] طراحی build artifact برای `@repo/ui` (`dist`)

## یادآوری برای مراحل بعد

در شروع هر جلسه بعدی، این فایل را مرور کن و آیتم‌های Todo را به‌ترتیب اولویت انجام بده.
