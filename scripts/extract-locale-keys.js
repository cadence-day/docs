#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

// Regex to match t('key'), t("key"), t(`key`)
const T_CALL_REGEX =
  /\bt\s*\(\s*(?:'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)"|`((?:\\.|[^`\\])*)`)\s*\)/g;

function extractKeysFromObject(obj, prefix = "") {
  const keys = [];
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    for (const [k, v] of Object.entries(obj)) {
      const next = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === "object" && !Array.isArray(v)) {
        keys.push(...extractKeysFromObject(v, next));
      } else {
        keys.push(next);
      }
    }
  }
  return keys;
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (err) {
    return null;
  }
}

function walkDir(dir, extensions = null, ignoredDirs = new Set()) {
  const results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) continue;
      results.push(...walkDir(full, extensions, ignoredDirs));
    } else if (entry.isFile()) {
      if (!extensions || extensions.includes(path.extname(entry.name))) {
        results.push(full);
      }
    }
  }
  return results;
}

function extractKeysFromSource(src) {
  const keys = [];
  let m;
  while ((m = T_CALL_REGEX.exec(src)) !== null) {
    const key = m[1] ?? m[2] ?? m[3];
    if (key) keys.push(key);
  }
  return keys;
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function buildTree(keys) {
  const root = {};
  for (const key of keys) {
    if (!key) continue;
    const parts = key.split(".");
    let node = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!(part in node)) {
        // If this is the final part, make it an empty string placeholder
        node[part] = i === parts.length - 1 ? "" : {};
      }
      // If we're not at the leaf but the current value is a string (previously set as leaf),
      // convert it into an object so we can nest children under it.
      if (i < parts.length - 1 && typeof node[part] === "string") {
        node[part] = {};
      }
      node = node[part];
    }
  }
  return root;
}

// Recursively sort object keys alphabetically at every level.
function sortTree(obj) {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return obj;
  const sorted = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = sortTree(obj[key]);
  }
  return sorted;
}

function main() {
  const args = process.argv.slice(2);
  // If path is a file and it's JSON, extract keys from JSON.
  // If it's a directory, scan source files for t('...') usages.
  const target =
    args[0] || path.join(__dirname, "..", "shared", "locales", "en.json");

  if (!fs.existsSync(target)) {
    console.error(`Path not found: ${target}`);
    process.exit(2);
  }

  const stat = fs.statSync(target);

  if (stat.isFile()) {
    const ext = path.extname(target).toLowerCase();
    if (ext === ".json") {
      const raw = readFileSafe(target);
      if (raw === null) {
        console.error(`Unable to read file: ${target}`);
        process.exit(2);
      }
      let json;
      try {
        json = raw.trim() === "" ? {} : JSON.parse(raw);
      } catch (err) {
        console.error(`Invalid JSON: ${err.message}`);
        process.exit(2);
      }
      const keys = extractKeysFromObject(json);
      console.log(JSON.stringify(uniq(keys).sort(), null, 2));
      return;
    }

    // Not JSON: treat as source file and extract t('...') occurrences
    const src = readFileSafe(target);
    if (src === null) {
      console.error(`Unable to read file: ${target}`);
      process.exit(2);
    }
    console.log(
      JSON.stringify(uniq(extractKeysFromSource(src)).sort(), null, 2)
    );
    return;
  }

  // Directory: walk and scan only .ts and .tsx files while ignoring large/build dirs
  const exts = new Set([".ts", ".tsx"]);
  const ignored = new Set([
    "node_modules",
    "ios",
    "android",
    "supabase",
    "build",
  ]);
  const files = walkDir(target, Array.from(exts), ignored);
  const allKeys = [];
  for (const f of files) {
    const src = readFileSafe(f);
    if (!src) continue;
    // Only scanning TS/TSX files here
    allKeys.push(...extractKeysFromSource(src));
  }

  // Filter out anything that looks like a package-lock or path artifact
  const filtered = uniq(allKeys).filter((k) => {
    if (!k || typeof k !== "string") return false;
    if (k.includes("node_modules")) return false;
    if (k.startsWith("packages.")) return false;
    if (k.includes("/")) return false;
    return true;
  });

  // Check for --tree or --format=tree
  const argv = process.argv.slice(2).map((a) => a.trim());
  const wantsTree = argv.includes("--tree") || argv.includes("--format=tree");

  const outArgIndex = argv.findIndex((a) => a === "--out");
  const outPath =
    outArgIndex >= 0 && argv[outArgIndex + 1] ? argv[outArgIndex + 1] : null;
  const writeToStdout = argv.includes("--stdout");

  if (wantsTree) {
    const tree = buildTree(filtered);
    const sortedTree = sortTree(tree);
    const payload = JSON.stringify(sortedTree, null, 2);
    if (writeToStdout) {
      console.log(payload);
    } else {
      const defaultOut = path.join(
        __dirname,
        "..",
        "shared",
        "locales",
        "template.json"
      );
      const finalOut = outPath || defaultOut;
      fs.mkdirSync(path.dirname(finalOut), { recursive: true });
      fs.writeFileSync(finalOut, payload, "utf8");
      console.error(`Wrote tree to ${finalOut}`);
    }
  } else {
    const payload = JSON.stringify(filtered.sort(), null, 2);
    if (writeToStdout) {
      console.log(payload);
    } else {
      const defaultOut = path.join(
        __dirname,
        "..",
        "shared",
        "locales",
        "template.json"
      );
      const finalOut = outPath || defaultOut;
      fs.mkdirSync(path.dirname(finalOut), { recursive: true });
      fs.writeFileSync(finalOut, payload, "utf8");
      console.error(`Wrote array to ${finalOut}`);
    }
  }
}

if (require.main === module) main();
