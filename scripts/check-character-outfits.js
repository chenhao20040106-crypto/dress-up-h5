#!/usr/bin/env node

/**
 * 检查 outfitMap 中的角色立绘路径是否与磁盘文件一致。
 *
 * 使用方法：
 *   node scripts/check-character-outfits.js
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const MAIN_JS_PATH = path.join(PROJECT_ROOT, "main.js");
const CHARACTER_DIR = path.join(PROJECT_ROOT, "assets", "character");

/**
 * 从 main.js 的数据声明部分读取真实 outfitMap，避免另写一套映射规则。
 */
function loadOutfitMap() {
  const source = fs.readFileSync(MAIN_JS_PATH, "utf8");
  const marker = "// 获取页面元素。";
  const markerIndex = source.indexOf(marker);

  if (markerIndex === -1) {
    throw new Error("无法在 main.js 中找到 outfitMap 数据结束位置");
  }

  const dataSource =
    source.slice(0, markerIndex) +
    "\nglobalThis.__OUTFIT_MAP__ = outfitMap;";
  const sandbox = {
    window: { STORY_CHAPTERS: [] },
    console
  };

  vm.runInNewContext(dataSource, sandbox, { filename: "main.js" });
  return sandbox.__OUTFIT_MAP__;
}

/**
 * 递归列出目录内全部 PNG，并统一成项目相对路径。
 */
function listPngFiles(directory) {
  const files = [];

  function walk(currentDirectory) {
    fs.readdirSync(currentDirectory, { withFileTypes: true }).forEach((entry) => {
      const absolutePath = path.join(currentDirectory, entry.name);

      if (entry.isDirectory()) {
        walk(absolutePath);
      } else if (entry.isFile() && entry.name.endsWith(".png")) {
        files.push(
          path.relative(PROJECT_ROOT, absolutePath).split(path.sep).join("/")
        );
      }
    });
  }

  walk(directory);
  return files.sort();
}

function main() {
  const outfitMap = loadOutfitMap();
  const entries = Object.entries(outfitMap);
  const referencedPaths = new Set(entries.map(([, imagePath]) => imagePath));
  const characterFiles = listPngFiles(CHARACTER_DIR);
  const missing = entries.filter(([, imagePath]) => {
    return !fs.existsSync(path.join(PROJECT_ROOT, imagePath));
  });
  const unused = characterFiles.filter((filePath) => {
    return !referencedPaths.has(filePath);
  });

  console.log(`outfitMap 组合数：${entries.length}`);
  console.log(`引用的角色图片数：${referencedPaths.size}`);
  console.log(`磁盘角色 PNG 数：${characterFiles.length}`);
  console.log(`缺失路径数：${missing.length}`);
  console.log(`未使用图片数：${unused.length}`);

  if (missing.length > 0) {
    console.log("\n缺失路径：");
    missing.forEach(([key, imagePath]) => {
      console.log(`- ${key}: ${imagePath}`);
    });
  }

  if (unused.length > 0) {
    console.log("\n未使用图片：");
    unused.forEach((filePath) => console.log(`- ${filePath}`));
  }

  if (missing.length > 0) {
    process.exitCode = 1;
  }
}

main();
