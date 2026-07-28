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

export const getPromptFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { getPromptServer } = await import("./admin.server");
    const lvl = typeof data === "string" ? data : (data?.level ?? data?.data?.level);
    return getPromptServer(lvl);
  });

export const savePromptFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { updatePromptServer } = await import("./admin.server");
    return updatePromptServer(data);
  });

export const updateParentChildFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { updateParentChildAssessmentServer } = await import("./admin.server");
    return updateParentChildAssessmentServer(data);
  });

export const getAdminParentsFn = createServerFn({ method: "POST" })
  .handler(async () => {
    const { getAdminParentsListServer } = await import("./admin.server");
    return getAdminParentsListServer();
  });

export const deleteAssessmentFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { deleteAssessmentServer } = await import("./admin.server");
    return deleteAssessmentServer(data.id);
  });

export const getAdminStatsFn = createServerFn({ method: "POST" })
  .handler(async () => {
    const { getAdminStatsServer } = await import("./admin.server");
    return getAdminStatsServer();
  });

export const getAdminRecentFn = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async ({ data }) => {
    const { getAdminRecentListServer } = await import("./admin.server");
    return getAdminRecentListServer(data?.level);
  });

export const saveQuestionFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { saveQuestionServer } = await import("./admin.server");
    return saveQuestionServer(data);
  });

export const deleteQuestionFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { deleteQuestionServer } = await import("./admin.server");
    return deleteQuestionServer(data.id);
  });
