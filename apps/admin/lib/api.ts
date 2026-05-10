import { createApiClient } from "@repo/ui";

import { clearAccessToken, getAccessToken } from "./auth-token";
import { baseDataApiRoutes } from "./base-data-api";
const baseURL = process.env.NEXT_PUBLIC_APP_API_BASE_URL ?? "";

export const api = createApiClient({
  baseURL,
  envelope: {},
  getAccessToken: () => getAccessToken(),
  skipAuthorizationWhen: (req) =>
    Boolean((req.url ?? "").includes(baseDataApiRoutes.login)),
  onUnauthorized: () => {
    clearAccessToken();
    if (typeof window !== "undefined") {
      window.location.assign("/");
    }
  },
});
