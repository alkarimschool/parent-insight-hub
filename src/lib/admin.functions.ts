import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const saveAiSettingsFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { updateAiSettingsServer } = await import("./admin.server");
    return updateAiSettingsServer(data);
  });

export const saveWaSettingsFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { updateWaSettingsServer } = await import("./admin.server");
    return updateWaSettingsServer(data);
  });

export const saveWebsiteSettingsFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { updateWebsiteSettingsServer } = await import("./admin.server");
    return updateWebsiteSettingsServer(data);
  });

export const saveHomepageSettingsFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { updateHomepageSettingsServer } = await import("./admin.server");
    return updateHomepageSettingsServer(data);
  });

export const savePromptFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { updatePromptServer } = await import("./admin.server");
    return updatePromptServer(data);
  });
