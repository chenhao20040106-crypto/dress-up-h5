#!/usr/bin/env node

/**
 * 在轻量页面模型中执行真实 main.js，检查换装与剧情重置逻辑。
 *
 * 使用方法：
 *   node scripts/test-game-logic.js
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const PROJECT_ROOT = path.resolve(__dirname, "..");

function createClassList() {
  const classes = new Set();

  return {
    add: (...names) => names.forEach((name) => classes.add(name)),
    remove: (...names) => names.forEach((name) => classes.delete(name)),
    toggle(name, force) {
      const shouldAdd =
        typeof force === "boolean" ? force : !classes.has(name);

      if (shouldAdd) classes.add(name);
      else classes.delete(name);
      return shouldAdd;
    },
    contains: (name) => classes.has(name)
  };
}

function createElement(id = "") {
  return {
    id,
    src: "",
    value: "level_01",
    textContent: "",
    innerHTML: "",
    hidden: false,
    dataset: {},
    parentElement: { classList: createClassList() },
    classList: createClassList(),
    listeners: {},
    setAttribute() {},
    addEventListener(type, listener) {
      this.listeners[type] = listener;
    },
    querySelectorAll() {
      return [];
    }
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  const elements = new Map();
  const localStorageData = new Map();

  const document = {
    querySelector(selector) {
      if (!elements.has(selector)) {
        elements.set(selector, createElement(selector));
      }
      return elements.get(selector);
    },
    querySelectorAll() {
      return [];
    }
  };

  const window = {
    STORY_CHAPTERS: [],
    setTimeout: () => 1,
    clearTimeout() {}
  };

  const sandbox = {
    window,
    document,
    console,
    localStorage: {
      getItem: (key) => localStorageData.get(key) || null,
      setItem: (key, value) => localStorageData.set(key, value)
    }
  };

  vm.createContext(sandbox);
  vm.runInContext(
    fs.readFileSync(path.join(PROJECT_ROOT, "data", "storyLevels.js"), "utf8"),
    sandbox,
    { filename: "data/storyLevels.js" }
  );

  const testApiSource = `
    globalThis.__GAME_TEST_API__ = {
      selectHair,
      selectTop,
      selectBottom,
      selectDress,
      selectShoes,
      changeBackground,
      startStoryLevel,
      getState: () => ({
        currentHair,
        currentTop,
        currentBottom,
        currentDress,
        currentShoes,
        currentBg,
        key: getOutfitKey(),
        imagePath
      })
    };
  `;

  vm.runInContext(
    fs.readFileSync(path.join(PROJECT_ROOT, "main.js"), "utf8") + testApiSource,
    sandbox,
    { filename: "main.js" }
  );

  const api = sandbox.__GAME_TEST_API__;
  const getState = api.getState;

  assert(
    getState().imagePath === "assets/character/hair1/base/base.png",
    "初始人物路径不正确"
  );

  api.selectTop("top3");
  api.selectShoes("shoes2");
  assert(
    getState().imagePath ===
      "assets/character/hair1/shoes2/top3_shoes2.png",
    "top3 + shoes2 路径不正确"
  );

  api.selectTop("top3");
  assert(
    getState().imagePath ===
      "assets/character/hair1/shoes2/shoes2_only.png",
    "再次点击 top3 后没有保留 shoes2"
  );

  api.selectBottom("bottom2");
  api.selectTop("top1");
  assert(
    getState().imagePath ===
      "assets/character/hair1/outfit-shoes2/outfit_top1_bottom2_shoes2.png",
    "top1 + bottom2 + shoes2 路径不正确"
  );

  api.selectHair("hair2");
  assert(
    getState().imagePath ===
      "assets/character/hair2/outfit-shoes2/hair2_top1_bottom2_shoes2.png",
    "hair2 组合路径不正确"
  );

  api.selectDress("dress1");
  assert(
    getState().currentTop === null &&
      getState().currentBottom === null &&
      getState().imagePath ===
        "assets/character/hair2/shoes2/hair2_dress1_shoes2.png",
    "连衣裙互斥或 hair2 + dress1 + shoes2 路径不正确"
  );

  api.selectDress("dress1");
  assert(
    getState().imagePath ===
      "assets/character/hair2/shoes2/hair2_base_shoes2.png",
    "再次点击连衣裙后没有恢复剩余发型和鞋子状态"
  );

  const backgroundBefore = getState().currentBg;
  api.selectShoes("shoes2");
  assert(
    getState().currentBg === backgroundBefore,
    "换装操作不应修改背景"
  );

  api.startStoryLevel("chapter1_level1");
  assert(
    getState().currentHair === "hair1" &&
      getState().currentTop === null &&
      getState().currentBottom === null &&
      getState().currentDress === null &&
      getState().currentShoes === null &&
      getState().imagePath === "assets/character/hair1/base/base.png",
    "进入剧情关卡时没有重置到初始人物"
  );

  console.log("游戏逻辑测试：通过");
  console.log("已检查：初始立绘、组合路径、toggle、类别互斥、背景独立、剧情重置");
}

try {
  main();
} catch (error) {
  console.error(`游戏逻辑测试失败：${error.message}`);
  process.exitCode = 1;
}
