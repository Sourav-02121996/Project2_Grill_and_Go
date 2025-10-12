import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, "../../frontend/data");

export const loadJson = async (filename) => {
  const filePath = path.join(dataDir, filename);
  const fileContents = await readFile(filePath, "utf8");
  return JSON.parse(fileContents);
};
