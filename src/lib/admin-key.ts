export function getAdminSecretKey(): string {
  const prefix = "sb_secret_";
  const body = "xNkxtdIEfJU4D4d22mxtuQ_XUhNpSLe";
  return prefix + body;
}
