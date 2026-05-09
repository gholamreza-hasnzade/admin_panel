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
