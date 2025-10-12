// Script to replace environment variables in markdown files before build
// Usage: node scripts/replace-md-env-vars.js

const fs = require("fs");
const path = require("path");

// Get all environment variable names from process.env
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

function replaceEnvVarsInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let replaced = false;
  envVars.forEach((varName) => {
    const envValue = process.env[varName] || "";
    // Replace ${VAR_NAME} and $VAR_NAME
    const regex = new RegExp(`\\$\\{${varName}\\}|\\$${varName}`, "g");
    if (regex.test(content)) {
      content = content.replace(regex, envValue);
      replaced = true;
    }
  });
  if (replaced) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Replaced env vars in: ${filePath}`);
  }
}

function main() {
  const mdFiles = [
    ...getAllMarkdownFiles(docsDir),
    ...getAllMarkdownFiles(blogDir),
  ];
  mdFiles.forEach(replaceEnvVarsInFile);
  console.log("Environment variable replacement complete.");
}

main();
