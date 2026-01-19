import fs from "fs/promises";
import path from "path";

/**
 * Recursively walk `dir` and call `onFile(filePath)` for each .json file found.
 */
export default async function walk(dir, onFile) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, onFile);
    } else if (entry.isFile()) {
      await onFile(fullPath);
    }
  }
}
