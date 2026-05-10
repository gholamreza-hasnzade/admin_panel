# MyMedu (frontend)

مونوریپو **فقط فرانت‌اند**: اپ Next.js برای پنل مدیریت و پکیج‌های مشترک. داده و منطق سمت سرور از **API بیرونی** تأمین می‌شود (این ریپو بک‌اند ندارد).

## Apps و packages

- **`admin`** — اپ Next.js (پورت پیش‌فرض dev: **3000**)
- **`@repo/ui`** — کامپوننت‌های React مشترک
- **`@repo/eslint-config`** / **`@repo/typescript-config`** — تنظیمات ESLint و TypeScript

## دستورات

```sh
npm install
npm run dev          # همه workspaceها (فعلاً admin + packages)
npx turbo dev --filter=admin
npx turbo build --filter=admin
```

جزئیات بیشتر Turborepo: [turborepo.dev](https://turborepo.dev/docs).

---

## تحویل به تیم زیرساخت و عملیات

این بخش معماری کلی مخزن، اسکریپت‌های اجرا، و تنظیمات متغیرهای محیط (به‌ویژه آدرس سرویس بک‌اند) را برای استقرار و نگهداری توضیح می‌دهد.

### نمای کلی مخزن

| مورد | توضیح |
|------|--------|
| **نوع پروژه** | Monorepo با **npm workspaces** و **Turborepo** |
| **مدیر پکیج** | npm (نسخه در `package.json` ریشه: `packageManager`) |
| **نسخهٔ Node** | `>= 18` (مطابق `engines` در `package.json` ریشه) |

ساختار پوشه‌ها (خلاصه):

```
.
├── apps/
│   └── admin/              # اپلیکیشن ادمین (Next.js، رابط کاربری اصلی این مخزن)
├── packages/
│   ├── ui/                 # کتابخانهٔ UI مشترک (کامپوننت‌ها، کلاینت HTTP، و غیره) — بیلد جدا
│   ├── eslint-config/      # تنظیمات ESLint مشترک
│   └── typescript-config/  # تنظیمات TypeScript مشترک
├── turbo.json              # تعریف تسک‌های Turborepo (build، dev، lint، …)
└── package.json            # اسکریپت‌های سطح ریشه و لیست workspaceها
```

**اپ ادمین (`apps/admin`)** یک برنامهٔ **Next.js** است که از پکیج داخلی `@repo/ui` ایمپورت می‌کند. برای بیلد نهایی، پکیج `ui` باید در دسترس باشد؛ زنجیرهٔ وابستگی در `turbo.json` طوری تنظیم شده که بیلد پکیج‌های پایه قبل از اپ در نظر گرفته شود.

### نصب وابستگی‌ها

در ریشهٔ مخزن:

```bash
npm install
```

این دستور تمام workspaceها (`apps/*` و `packages/*`) را یک‌جا نصب می‌کند.

### اسکریپت‌ها

**سطح ریشه (`package.json` در `/`)**

| اسکریپت | دستور | کاربرد |
|---------|--------|--------|
| **توسعهٔ همزمان** | `npm run dev` | اجرای `turbo run dev` — معمولاً سرور توسعهٔ اپ(ها) و در صورت نیاز watch در پکیج‌ها |
| **بیلد تولید** | `npm run build` | `turbo run build` — بیلد تمام workspaceها طبق `turbo.json` |
| **lint** | `npm run lint` | `turbo run lint` |
| **بررسی نوع TypeScript** | `npm run check-types` | `turbo run check-types` |
| **فرمت کد** | `npm run format` | Prettier روی `*.ts`, `*.tsx`, `*.md` |

برای کار روزمره روی **فقط اپ ادمین**:

```bash
npm run dev --workspace=admin
npm run build --workspace=admin
npm run lint --workspace=admin
npm run check-types --workspace=admin
```

**اپ ادمین (`apps/admin/package.json`)**

| اسکریپت | دستور واقعی | کاربرد |
|---------|-------------|--------|
| **dev** | `next dev --port 3000` | سرور توسعه؛ پیش‌فرض پورت **3000** |
| **build** | `next build` | بیلد تولید Next.js |
| **start** | `next start --port 3000` | اجرای خروجی بیلد (پس از `build`)، پورت **3000** |
| **lint** | `eslint --max-warnings 0` | ESLint بدون هشدار |
| **check-types** | `next typegen && tsc --noEmit` | تولید تایپ‌های مسیر Next + بررسی TypeScript |

**پکیج UI (`packages/ui/package.json`)**

| اسکریپت | کاربرد |
|---------|--------|
| `npm run build --workspace=@repo/ui` | بیلد خروجی `dist` (tsup) |
| `npm run dev --workspace=@repo/ui` | watch هنگام توسعهٔ UI |

در محیط تولید، معمولاً `npm run build` از ریشه طبق Turborepo پکیج `ui` را هم می‌سازد.

### Turborepo و ترتیب بیلد

فایل `turbo.json` تعیین می‌کند:

- **`build`** به `^build` و `check-types` وابسته است (پکیج‌های وابسته اول بیلد/چک می‌شوند).
- ورودی‌ها شامل `.env*` هستند تا با تغییر env، کش بیلد بی‌ربط نشود.
- خروجی اپ Next در `.next/**` (به‌جز کش) ذخیره می‌شود.

### متغیرهای محیط و آدرس سرویس API

**محل فایل:** برای **اپ ادمین**، متغیرهای محیط معمولاً در **`apps/admin/.env`** یا **`apps/admin/.env.local`** (و در CI/CD متغیرهای محیط سرور) قرار می‌گیرند. Next.js فایل‌های `.env*` را در زمان اجرا/بیلد بارگذاری می‌کند.

**متغیرهای لازم (طبق کد فعلی)**

| متغیر | نقش در پروژه |
|--------|----------------|
| **`NEXT_PUBLIC_APP_API_BASE_URL`** | **آدرس پایهٔ Axios** برای تمام درخواست‌های HTTP به بک‌اند. در `apps/admin/lib/api.ts` به‌صورت `baseURL` به کلاینت API داده می‌شود. **باید در مرورگر در دسترس باشد**؛ بنابراین پیشوند `NEXT_PUBLIC_` برای Next.js ضروری است. |
| **`NEXT_PUBLIC_SSO_PORTAL_URL`** | آدرس پورتال/سامانهٔ SSO برای ورود و لینک‌ها (مثلاً در `sso-home.tsx` و `admin-shell.tsx`). در صورت عدم تنظیم، در کد مقادیر پیش‌فرض جایگزین استفاده می‌شود. |

**نمونهٔ تنظیم (هم‌تراز با `.env`)**

```env
NEXT_PUBLIC_APP_API_BASE_URL=http://192.168.13.60:5003/api/
NEXT_PUBLIC_SSO_PORTAL_URL=https://my.medu.ir
```

**تفسیر `NEXT_PUBLIC_APP_API_BASE_URL`:**

- این مقدار **ریشهٔ URL** است که کلاینت به آن **مسیرهای نسبی** را می‌چسباند.
- در این مخزن، مسیرهای داخل کانفیگ فیچرها به‌صورت **بخش‌های نسبی** تعریف شده‌اند (مثلاً `Notification/GetAll`) و با `baseURL` ترکیب می‌شوند.
- اگر `baseURL` را با **پسوند `/api/`** بگذارید (مثل نمونهٔ بالا)، درخواست‌ها به شکل زیر ساخته می‌شوند:
  - پایه: `http://192.168.13.60:5003/api/`
  - مسیر نسبی از کانفیگ: `Notification/GetAll`
  - نتیجهٔ معمول: `http://192.168.13.60:5003/api/Notification/GetAll`

**نکات عملیاتی برای زیرساخت:**

1. **HTTPS در تولید:** در محیط واقعی معمولاً به‌جای IP داخلی، دامنه و TLS استفاده می‌شود؛ مقدار `NEXT_PUBLIC_APP_API_BASE_URL` باید همان آدرس قابل دسترس از **مرورگر کاربر** باشد (CORS و فایروال روی بک‌اند باید اجازهٔ فراخوانی از دامنهٔ ادمین را بدهند).
2. **زمان تزریق متغیر در Next.js:** متغیرهای `NEXT_PUBLIC_*` در **زمان بیلد** در باندل کلاینت قرار می‌گیرند. برای تغییر آدرس API بدون بیلد مجدد، باید زنجیرهٔ استقرار (CI/CD) یا استراتژی runtime را مطابق سیاست تیم تنظیم کنید.
3. **خالی بودن `NEXT_PUBLIC_APP_API_BASE_URL`:** در برخی صفحات (مثل گرید داده و صفحهٔ SSO) اگر این متغیر خالی باشد، پیام خطا به کاربر نشان داده می‌شود؛ برای عملکرد درست باید در هر محیط (dev/stage/prod) مقداردهی شود.

### پورت و استقرار پیشنهادی

| سرویس | پورت پیش‌فرض در اسکریپت |
|--------|-------------------------|
| اپ ادمین (Next dev / start) | **3000** |

در Docker یا reverse proxy، پورت کانتینر را به 3000 نگاشت کنید یا متغیر پورت Next را طبق مستندات رسمی Next.js تغییر دهید.

### جمع‌بندی برای تیم زیرساخت

1. **Node ≥ 18** و **npm** مطابق `packageManager` ریشه.
2. **`npm install`** در ریشه.
3. تنظیم **`apps/admin/.env`** (یا معادل در سرور) حداقل با **`NEXT_PUBLIC_APP_API_BASE_URL`** و در صورت نیاز **`NEXT_PUBLIC_SSO_PORTAL_URL`**.
4. برای تولید: **`npm run build`** از ریشه (یا بیلد workspace ادمین پس از آم بودن `@repo/ui`).
5. اجرای تولید: در اپ ادمین **`npm run start`** (پورت 3000) یا اجرای معادل در ارکستراتور.

در صورت نیاز به جزئیات بیشتر دربارهٔ مسیرهای API داخل کد، فایل‌های کانفیگ فیچرها در `apps/admin/features/*/lib/config.ts` و کلاینت مشترک در `apps/admin/lib/api.ts` مرجع هستند.
