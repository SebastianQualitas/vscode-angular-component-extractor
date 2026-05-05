import * as fs from "fs";
import * as path from "path";

export type StyleExtension = "scss" | "sass" | "less" | "css";

const STYLE_EXTENSIONS: StyleExtension[] = ["scss", "sass", "less", "css"];

/**
 * Detect the style extension used in a directory by looking for existing style files.
 * Falls back to "css" if nothing is found.
 */
export function detectStyleExtension(directory: string): StyleExtension {
  try {
    const files = fs.readdirSync(directory);
    for (const ext of STYLE_EXTENSIONS) {
      if (files.some((f) => f.endsWith(`.${ext}`))) {
        return ext;
      }
    }
  } catch {
    // ignore read errors
  }
  return "css";
}

/**
 * Given an HTML template file path, find the associated style file in the same directory.
 * Looks for a file with the same base name and a known style extension.
 * Returns the file content as a string, or empty string if not found.
 */
export function readAssociatedStyles(htmlFilePath: string): string {
  const dir = path.dirname(htmlFilePath);
  const base = path.basename(htmlFilePath, ".html");

  for (const ext of STYLE_EXTENSIONS) {
    const stylePath = path.join(dir, `${base}.${ext}`);
    if (fs.existsSync(stylePath)) {
      try {
        return fs.readFileSync(stylePath, "utf-8");
      } catch {
        return "";
      }
    }
  }
  return "";
}
