export function resolveAssetPath(assetPath?: string | null): string {
  const normalizedPath = String(assetPath || "").trim();

  if (!normalizedPath) {
    return "";
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  return normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
}

export const resolveNewsAssetPath = resolveAssetPath;
