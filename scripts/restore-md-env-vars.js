// Script to restore environment variable placeholders in markdown files
// Usage: node scripts/restore-md-env-vars.js

const fs = require("fs");
const path = require("path");

// Get all environment variable names and values from process.env
const envVars = Object.keys(process.env);

// Directory to search for markdown files
const docsDir = path.resolve(__dirname, "../docs");
const blogDir = path.resolve(__dirname, "../blog");

function getAllMarkdownFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllMarkdownFiles(filePath));
    } else if (file.endsWith(".md")) {
      results.push(filePath);
    }
  });
  return results;
}

function restoreEnvVarsInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let replaced = false;
  envVars.forEach((varName) => {
    const envValue = process.env[varName] || "";
    if (!envValue) return;
    // Replace env value with ${VAR_NAME}
    const regex = new RegExp(
      envValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "g"
    );
    if (regex.test(content)) {
      content = content.replace(regex, `\${${varName}}`);
      replaced = true;
    }
  });
  if (replaced) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Restored env vars in: ${filePath}`);
  }
}

function main() {
  const mdFiles = [
    ...getAllMarkdownFiles(docsDir),
    ...getAllMarkdownFiles(blogDir),
  ];
  mdFiles.forEach(restoreEnvVarsInFile);
  console.log("Environment variable restoration complete.");
}

main();
