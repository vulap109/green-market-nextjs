import { promises as fs } from "node:fs";
import path from "node:path";
import { TextDecoder } from "node:util";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const decoder = new TextDecoder("utf-8", { fatal: true });
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx"
]);

const ignoredDirs = new Set([
  ".git",
  ".next",
  "node_modules",
  "public/images"
]);

async function walk(dirPath, relativeDir = "") {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const nextRelative = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
    const nextAbsolute = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (ignoredDirs.has(nextRelative)) {
        continue;
      }

      files.push(...await walk(nextAbsolute, nextRelative));
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (textExtensions.has(extension)) {
      files.push(nextRelative);
    }
  }

  return files;
}

async function main() {
  const files = await walk(repoRoot);
  const invalid = [];

  for (const relativePath of files) {
    const absolutePath = path.join(repoRoot, relativePath);
    const buffer = await fs.readFile(absolutePath);

    try {
      decoder.decode(buffer);
    } catch (error) {
      invalid.push(relativePath);
    }
  }

  if (invalid.length) {
    console.error("Invalid UTF-8 files:");
    for (const file of invalid) {
      console.error(`- ${file}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`UTF-8 OK: checked ${files.length} text files.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
