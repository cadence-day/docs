#!/usr/bin/env node
/**
 * Usage:
 *   node scripts/bump_version.js --mode=staging
 *   node scripts/bump_version.js --mode=main --prTitle="[2.1.0] some feature"
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2).reduce((acc, arg) => {
  const [k, v] = arg.split('=');
  acc[k.replace(/^--/, '')] = v;
  return acc;
}, {});

const mode = args.mode;
const prTitle = args.prTitle || '';

const appJsonPath = path.join(process.cwd(), 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
const expo = appJson.expo;

function bumpBuildNumber(buildNumber) {
  const n = parseInt(buildNumber, 10);
  if (isNaN(n)) return '1';
  return String(n + 1);
}
function bumpSemver(ver) {
  const [major, minor, patch] = ver.split('.').map(n => parseInt(n, 10));
  return `${major}.${minor}.${patch + 1}`;
}
const match = prTitle.match(/\[(\d+\.\d+\.\d+)\]/);

if (mode === 'staging') {
  expo.ios.buildNumber = bumpBuildNumber(expo.ios.buildNumber);
  if (expo.android && expo.android.versionCode) {
    expo.android.versionCode = parseInt(expo.android.versionCode, 10) + 1;
  }
} else if (mode === 'main') {
  expo.ios.buildNumber = bumpBuildNumber(expo.ios.buildNumber);
  if (expo.android && expo.android.versionCode) {
    expo.android.versionCode = parseInt(expo.android.versionCode, 10) + 1;
  }
  if (match) {
    expo.version = match[1];
  } else {
    expo.version = bumpSemver(expo.version);
  }
} else {
  console.error('Unknown mode');
  process.exit(1);
}

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
console.log(`New version: ${expo.version}, build: ${expo.ios.buildNumber}`);
