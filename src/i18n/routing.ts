import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "eu"],
  defaultLocale: "es",
  localePrefix: "as-needed",
});
