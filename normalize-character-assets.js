#!/usr/bin/env node

/**
 * 批量检查并规范完整角色立绘。
 *
 * 使用方法：
 *   node scripts/normalize-character-assets.js
 *   node scripts/normalize-character-assets.js --write
 *   node scripts/normalize-character-assets.js --hair1-shoes
 *   node scripts/normalize-character-assets.js --hair1-shoes --write
 *
 * 默认只检查，不修改文件。加入 --write 后会：
 * 1. 将需要修改的原图备份到系统临时目录。
 * 2. 清理 hair2 立绘的浅色底、棋盘格残留和硬边。
 * 3. 将人物统一放到 1086×1448 画布，并对齐头顶、脚底和中心线。
 * 4. 加入 --hair1-shoes 时，只清理 hair1 带鞋子立绘的头发残边，不改变尺寸和位置。
 *
 * 运行前需要安装 sharp：
 *   npm install sharp
 */

const fs = require("fs");
const os = require("os");
const path = require("path");

let sharp;

try {
  sharp = require("sharp");
} catch (error) {
  console.error("缺少图片处理依赖 sharp，请先运行：npm install sharp");
  process.exit(1);
}

const PROJECT_ROOT = path.resolve(__dirname, "..");
const CHARACTER_DIR = path.join(PROJECT_ROOT, "assets", "character");
const SHOULD_WRITE = process.argv.includes("--write");
const FORCE_WRITE = process.argv.includes("--force");
const CLEAN_HAIR1_SHOES = process.argv.includes("--hair1-shoes");

// 以项目当前默认 hair1 立绘为基准。
const TARGET = {
  width: 1086,
  height: 1448,
  subjectTop: 60,
  subjectBottom: 1299,
  subjectHeight: 1240,
  centerX: 542.5
};

// 只处理完整角色图，角色缩略图不参与尺寸统一。
const EXCLUDED_FILES = new Set(["dress1_thumb.png"]);
const ALPHA_BBOX_THRESHOLD = 8;
const EDGE_RADIUS = 4;
const MIN_ALPHA = 0.035;

/**
 * 读取角色目录中的完整立绘文件。
 */
function getCharacterFiles() {
  const files = fs
    .readdirSync(CHARACTER_DIR)
    .filter(
      (fileName) =>
        fileName.endsWith(".png") && !EXCLUDED_FILES.has(fileName)
    )
    .sort();

  if (CLEAN_HAIR1_SHOES) {
    return files.filter(isHair1ShoeFile);
  }

  return files;
}

/**
 * 判断文件是否为默认发色 hair1 的带鞋子完整立绘。
 */
function isHair1ShoeFile(fileName) {
  return (
    !fileName.startsWith("hair2_") &&
    /(?:^|_)shoes[12](?:_|\.png$)/.test(fileName)
  );
}

/**
 * 根据 alpha 通道计算人物主体边界。
 */
function getAlphaBounds(data, info, threshold = ALPHA_BBOX_THRESHOLD) {
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  let opaquePixels = 0;
  let partialPixels = 0;
  let transparentPixels = 0;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const pixelIndex = (y * info.width + x) * info.channels;
      const alpha = data[pixelIndex + 3];

      if (alpha === 0) {
        transparentPixels += 1;
        continue;
      }

      if (alpha === 255) {
        opaquePixels += 1;
      } else {
        partialPixels += 1;
      }

      if (alpha < threshold) {
        continue;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < 0 || maxY < 0) {
    return null;
  }

  return {
    left: minX,
    top: minY,
    right: maxX,
    bottom: maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    centerX: (minX + maxX) / 2,
    opaquePixels,
    partialPixels,
    transparentPixels
  };
}

/**
 * 判断图片是否已经符合项目统一画布和人物位置。
 */
function isAlreadyNormalized(info, bounds) {
  if (!bounds) {
    return false;
  }

  return (
    info.width === TARGET.width &&
    info.height === TARGET.height &&
    Math.abs(bounds.top - TARGET.subjectTop) <= 2 &&
    Math.abs(bounds.bottom - TARGET.subjectBottom) <= 2 &&
    Math.abs(bounds.centerX - TARGET.centerX) <= 2
  );
}

/**
 * 只保留最大的透明主体，删除与人物不相连的小块底色和棋盘格碎片。
 */
function keepLargestAlphaComponent(data, info) {
  const pixelCount = info.width * info.height;
  const labels = new Int32Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  const componentSizes = [0];
  let componentId = 0;

  for (let start = 0; start < pixelCount; start += 1) {
    const alpha = data[start * info.channels + 3];

    if (alpha === 0 || labels[start] !== 0) {
      continue;
    }

    componentId += 1;
    let head = 0;
    let tail = 0;
    let size = 0;

    queue[tail] = start;
    tail += 1;
    labels[start] = componentId;

    while (head < tail) {
      const current = queue[head];
      head += 1;
      size += 1;

      const x = current % info.width;
      const y = Math.floor(current / info.width);
      const neighbors = [];

      if (x > 0) neighbors.push(current - 1);
      if (x < info.width - 1) neighbors.push(current + 1);
      if (y > 0) neighbors.push(current - info.width);
      if (y < info.height - 1) neighbors.push(current + info.width);

      for (const neighbor of neighbors) {
        if (
          labels[neighbor] === 0 &&
          data[neighbor * info.channels + 3] > 0
        ) {
          labels[neighbor] = componentId;
          queue[tail] = neighbor;
          tail += 1;
        }
      }
    }

    componentSizes[componentId] = size;
  }

  let largestId = 0;
  let largestSize = 0;

  for (let id = 1; id < componentSizes.length; id += 1) {
    if (componentSizes[id] > largestSize) {
      largestId = id;
      largestSize = componentSizes[id];
    }
  }

  let removedPixels = 0;

  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    if (labels[pixel] !== 0 && labels[pixel] !== largestId) {
      const offset = pixel * info.channels;
      data[offset] = 0;
      data[offset + 1] = 0;
      data[offset + 2] = 0;
      data[offset + 3] = 0;
      removedPixels += 1;
    }
  }

  return removedPixels;
}

/**
 * 清除卷发内部被包围的白底或棋盘格孔洞。
 * 这些区域无法通过“从画布边缘找背景”识别，因此按原底色特征和发型侧边位置判断。
 */
function removeHairBackgroundHoles(data, info, bounds) {
  const pixelCount = info.width * info.height;
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  const sideThreshold = bounds.width * 0.28;
  const hairBottom = bounds.top + bounds.height * 0.62;
  let removedPixels = 0;
  let removedComponents = 0;

  /**
   * 原始棋盘格和浅色底主要是接近灰白色的像素。
   */
  function isBackgroundColor(pixel) {
    const offset = pixel * info.channels;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const alpha = data[offset + 3];
    const maximum = Math.max(red, green, blue);
    const minimum = Math.min(red, green, blue);
    const average = (red + green + blue) / 3;

    return alpha > 0 && maximum - minimum <= 12 && average >= 238;
  }

  for (let start = 0; start < pixelCount; start += 1) {
    if (visited[start] || !isBackgroundColor(start)) {
      continue;
    }

    let head = 0;
    let tail = 0;
    let minX = info.width;
    let minY = info.height;
    let maxX = -1;
    let maxY = -1;

    queue[tail] = start;
    tail += 1;
    visited[start] = 1;

    while (head < tail) {
      const current = queue[head];
      head += 1;
      const x = current % info.width;
      const y = Math.floor(current / info.width);

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);

      const neighbors = [];
      if (x > 0) neighbors.push(current - 1);
      if (x < info.width - 1) neighbors.push(current + 1);
      if (y > 0) neighbors.push(current - info.width);
      if (y < info.height - 1) neighbors.push(current + info.width);

      for (const neighbor of neighbors) {
        if (!visited[neighbor] && isBackgroundColor(neighbor)) {
          visited[neighbor] = 1;
          queue[tail] = neighbor;
          tail += 1;
        }
      }
    }

    const componentCenterX = (minX + maxX) / 2;
    const componentCenterY = (minY + maxY) / 2;
    const isInHairSide =
      Math.abs(componentCenterX - bounds.centerX) >= sideThreshold &&
      componentCenterY <= hairBottom;

    // 大块封闭灰白区域才视为原背景，避免误删高光和细小白色装饰。
    if (tail >= 20 && isInHairSide) {
      for (let index = 0; index < tail; index += 1) {
        const offset = queue[index] * info.channels;
        data[offset] = 0;
        data[offset + 1] = 0;
        data[offset + 2] = 0;
        data[offset + 3] = 0;
      }

      removedPixels += tail;
      removedComponents += 1;
    }
  }

  return { removedPixels, removedComponents };
}

/**
 * 删除 hair1 鞋子组合中被深色卷发包围的浅色背景块。
 * 只处理发型两侧上半区，避免误删眼白、皮肤和浅色服装。
 */
function removeHair1ShoeBackgroundHoles(data, info, bounds) {
  const pixelCount = info.width * info.height;
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  const sideThreshold = bounds.width * 0.24;
  const hairBottom = bounds.top + bounds.height * 0.48;
  let removedPixels = 0;
  let removedComponents = 0;

  function isBackgroundColor(pixel) {
    const offset = pixel * info.channels;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const alpha = data[offset + 3];
    const maximum = Math.max(red, green, blue);
    const minimum = Math.min(red, green, blue);
    const average = (red + green + blue) / 3;

    return alpha > 0 && maximum - minimum <= 18 && average >= 215;
  }

  for (let start = 0; start < pixelCount; start += 1) {
    if (visited[start] || !isBackgroundColor(start)) {
      continue;
    }

    let head = 0;
    let tail = 0;
    let minX = info.width;
    let minY = info.height;
    let maxX = -1;
    let maxY = -1;

    queue[tail] = start;
    tail += 1;
    visited[start] = 1;

    while (head < tail) {
      const current = queue[head];
      head += 1;
      const x = current % info.width;
      const y = Math.floor(current / info.width);

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);

      const neighbors = [];
      if (x > 0) neighbors.push(current - 1);
      if (x < info.width - 1) neighbors.push(current + 1);
      if (y > 0) neighbors.push(current - info.width);
      if (y < info.height - 1) neighbors.push(current + info.width);

      for (const neighbor of neighbors) {
        if (!visited[neighbor] && isBackgroundColor(neighbor)) {
          visited[neighbor] = 1;
          queue[tail] = neighbor;
          tail += 1;
        }
      }
    }

    const componentCenterX = (minX + maxX) / 2;
    const componentCenterY = (minY + maxY) / 2;
    const isInHairSide =
      Math.abs(componentCenterX - bounds.centerX) >= sideThreshold &&
      componentCenterY <= hairBottom;

    if (tail >= 12 && isInHairSide) {
      for (let index = 0; index < tail; index += 1) {
        const offset = queue[index] * info.channels;
        data[offset] = 0;
        data[offset + 1] = 0;
        data[offset + 2] = 0;
        data[offset + 3] = 0;
      }

      removedPixels += tail;
      removedComponents += 1;
    }
  }

  return { removedPixels, removedComponents };
}

/**
 * 清理 hair1 鞋子组合头发外轮廓上的白边和灰边。
 * 只修改头发区域紧邻透明背景的少量像素，不改变人物尺寸和位置。
 */
function cleanHair1ShoeBoundary(data, info, bounds) {
  const pixelCount = info.width * info.height;
  const distance = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let head = 0;
  let tail = 0;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const pixel = y * info.width + x;
      const offset = pixel * info.channels;

      if (data[offset + 3] === 0) {
        continue;
      }

      const neighbors = [];
      if (x > 0) neighbors.push(pixel - 1);
      if (x < info.width - 1) neighbors.push(pixel + 1);
      if (y > 0) neighbors.push(pixel - info.width);
      if (y < info.height - 1) neighbors.push(pixel + info.width);

      if (
        neighbors.some(
          (neighbor) => data[neighbor * info.channels + 3] === 0
        )
      ) {
        distance[pixel] = 1;
        queue[tail] = pixel;
        tail += 1;
      }
    }
  }

  while (head < tail) {
    const current = queue[head];
    head += 1;
    const currentDistance = distance[current];

    if (currentDistance >= 3) {
      continue;
    }

    const x = current % info.width;
    const y = Math.floor(current / info.width);
    const neighbors = [];
    if (x > 0) neighbors.push(current - 1);
    if (x < info.width - 1) neighbors.push(current + 1);
    if (y > 0) neighbors.push(current - info.width);
    if (y < info.height - 1) neighbors.push(current + info.width);

    for (const neighbor of neighbors) {
      if (
        data[neighbor * info.channels + 3] > 0 &&
        distance[neighbor] === 0
      ) {
        distance[neighbor] = currentDistance + 1;
        queue[tail] = neighbor;
        tail += 1;
      }
    }
  }

  const hairBottom = bounds.top + bounds.height * 0.48;
  const faceHalfWidth = bounds.width * 0.16;
  let clearedPixels = 0;
  let softenedPixels = 0;

  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    const offset = pixel * info.channels;
    const alpha = data[offset + 3];

    if (alpha === 0) {
      data[offset] = 0;
      data[offset + 1] = 0;
      data[offset + 2] = 0;
      continue;
    }

    if (distance[pixel] === 0) {
      continue;
    }

    const x = pixel % info.width;
    const y = Math.floor(pixel / info.width);
    const isInHairRegion =
      y <= hairBottom &&
      (Math.abs(x - bounds.centerX) >= faceHalfWidth ||
        y < bounds.top + bounds.height * 0.12);

    if (!isInHairRegion) {
      continue;
    }

    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const maximum = Math.max(red, green, blue);
    const minimum = Math.min(red, green, blue);
    const average = (red + green + blue) / 3;

    if (maximum - minimum <= 32 && average >= 225) {
      data[offset] = 0;
      data[offset + 1] = 0;
      data[offset + 2] = 0;
      data[offset + 3] = 0;
      clearedPixels += 1;
    } else if (
      maximum - minimum <= 42 &&
      average >= 175 &&
      alpha < 250
    ) {
      // 浅灰抗锯齿改为接近深色头发的半透明棕色，避免背景上出现白线。
      data[offset] = 55;
      data[offset + 1] = 40;
      data[offset + 2] = 32;
      data[offset + 3] = Math.min(
        alpha,
        distance[pixel] === 1 ? 110 : 190
      );
      softenedPixels += 1;
    }
  }

  return { clearedPixels, softenedPixels };
}

/**
 * 根据透明区的局部底色重建人物边缘 alpha，并去除白边、灰边和棋盘格污染。
 * 只处理轮廓附近 EDGE_RADIUS 像素，人物内部颜色不会被修改。
 */
function rebuildHair2Edge(data, info) {
  const pixelCount = info.width * info.height;
  const distance = new Uint8Array(pixelCount);
  const nearestBackground = new Int32Array(pixelCount);
  nearestBackground.fill(-1);
  const queue = new Int32Array(pixelCount);
  let head = 0;
  let tail = 0;

  // 找到紧邻透明区域的第一圈人物边缘。
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const pixel = y * info.width + x;
      const offset = pixel * info.channels;

      if (data[offset + 3] === 0) {
        continue;
      }

      const neighbors = [];
      if (x > 0) neighbors.push(pixel - 1);
      if (x < info.width - 1) neighbors.push(pixel + 1);
      if (y > 0) neighbors.push(pixel - info.width);
      if (y < info.height - 1) neighbors.push(pixel + info.width);

      const backgroundPixel = neighbors.find(
        (neighbor) => data[neighbor * info.channels + 3] === 0
      );

      if (backgroundPixel !== undefined) {
        distance[pixel] = 1;
        nearestBackground[pixel] = backgroundPixel;
        queue[tail] = pixel;
        tail += 1;
      }
    }
  }

  // 向人物内部扩展少量像素，覆盖被原背景污染的抗锯齿区域。
  while (head < tail) {
    const current = queue[head];
    head += 1;
    const currentDistance = distance[current];

    if (currentDistance >= EDGE_RADIUS) {
      continue;
    }

    const x = current % info.width;
    const y = Math.floor(current / info.width);
    const neighbors = [];

    if (x > 0) neighbors.push(current - 1);
    if (x < info.width - 1) neighbors.push(current + 1);
    if (y > 0) neighbors.push(current - info.width);
    if (y < info.height - 1) neighbors.push(current + info.width);

    for (const neighbor of neighbors) {
      const neighborOffset = neighbor * info.channels;

      if (
        data[neighborOffset + 3] > 0 &&
        distance[neighbor] === 0
      ) {
        distance[neighbor] = currentDistance + 1;
        nearestBackground[neighbor] = nearestBackground[current];
        queue[tail] = neighbor;
        tail += 1;
      }
    }
  }

  // 从安全的内部像素向轮廓传播真实人物颜色，供边缘去底色时参考。
  const nearestInterior = new Int32Array(pixelCount);
  nearestInterior.fill(-1);
  head = 0;
  tail = 0;

  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    const offset = pixel * info.channels;

    if (data[offset + 3] > 0 && distance[pixel] === 0) {
      nearestInterior[pixel] = pixel;
      queue[tail] = pixel;
      tail += 1;
    }
  }

  while (head < tail) {
    const current = queue[head];
    head += 1;
    const x = current % info.width;
    const y = Math.floor(current / info.width);
    const neighbors = [];

    if (x > 0) neighbors.push(current - 1);
    if (x < info.width - 1) neighbors.push(current + 1);
    if (y > 0) neighbors.push(current - info.width);
    if (y < info.height - 1) neighbors.push(current + info.width);

    for (const neighbor of neighbors) {
      const neighborOffset = neighbor * info.channels;

      if (
        data[neighborOffset + 3] > 0 &&
        nearestInterior[neighbor] === -1
      ) {
        nearestInterior[neighbor] = nearestInterior[current];
        queue[tail] = neighbor;
        tail += 1;
      }
    }
  }

  let rebuiltPixels = 0;
  let clearedPixels = 0;

  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    const offset = pixel * info.channels;
    const currentAlpha = data[offset + 3];

    if (currentAlpha === 0) {
      // 透明区 RGB 也清零，防止缩放时把棋盘格颜色重新带入边缘。
      data[offset] = 0;
      data[offset + 1] = 0;
      data[offset + 2] = 0;
      continue;
    }

    if (distance[pixel] === 0) {
      continue;
    }

    const backgroundPixel = nearestBackground[pixel];
    const backgroundOffset = backgroundPixel * info.channels;
    const backgroundR = data[backgroundOffset];
    const backgroundG = data[backgroundOffset + 1];
    const backgroundB = data[backgroundOffset + 2];
    const redDiff = data[offset] - backgroundR;
    const greenDiff = data[offset + 1] - backgroundG;
    const blueDiff = data[offset + 2] - backgroundB;
    const colorDistance = Math.sqrt(
      redDiff * redDiff + greenDiff * greenDiff + blueDiff * blueDiff
    );

    // 将与底色很接近的像素变透明，对明显属于人物的轮廓保持不透明。
    let edgeAlpha = (colorDistance - 12) / 110;
    edgeAlpha = Math.max(0, Math.min(1, edgeAlpha));
    edgeAlpha = edgeAlpha * edgeAlpha * (3 - 2 * edgeAlpha);

    if (edgeAlpha < MIN_ALPHA) {
      data[offset] = 0;
      data[offset + 1] = 0;
      data[offset + 2] = 0;
      data[offset + 3] = 0;
      clearedPixels += 1;
      continue;
    }

    if (edgeAlpha < 0.999) {
      // 边缘颜色向人物内部的真实颜色收敛，避免反推时产生过亮的白色描边。
      const interiorPixel = nearestInterior[pixel];
      const interiorOffset =
        interiorPixel >= 0 ? interiorPixel * info.channels : offset;
      const originalWeight = edgeAlpha;
      const interiorWeight = 1 - originalWeight;

      data[offset] = Math.round(
        data[offset] * originalWeight +
          data[interiorOffset] * interiorWeight
      );
      data[offset + 1] = Math.round(
        data[offset + 1] * originalWeight +
          data[interiorOffset + 1] * interiorWeight
      );
      data[offset + 2] = Math.round(
        data[offset + 2] * originalWeight +
          data[interiorOffset + 2] * interiorWeight
      );
      data[offset + 3] = Math.round(edgeAlpha * 255);
      rebuiltPixels += 1;
    }
  }

  return { rebuiltPixels, clearedPixels };
}

/**
 * 将人物主体按统一高度缩放后放入目标透明画布。
 */
async function placeOnTargetCanvas(data, info, bounds) {
  const cropped = sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  }).extract({
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
    height: bounds.height
  });

  const resized = await cropped
    .resize({
      height: TARGET.subjectHeight,
      kernel: sharp.kernel.lanczos3
    })
    .png()
    .toBuffer({ resolveWithObject: true });

  if (resized.info.width > TARGET.width - 40) {
    throw new Error(
      `主体缩放后宽度 ${resized.info.width}px 超出安全范围，需要人工检查`
    );
  }

  const left = Math.round((TARGET.width - resized.info.width) / 2);

  return sharp({
    create: {
      width: TARGET.width,
      height: TARGET.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      {
        input: resized.data,
        left,
        top: TARGET.subjectTop
      }
    ])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

/**
 * 原子写入 PNG，避免处理中断时留下不完整文件。
 */
function writeFileAtomically(filePath, buffer) {
  const temporaryPath = `${filePath}.normalizing`;
  fs.writeFileSync(temporaryPath, buffer);
  fs.renameSync(temporaryPath, filePath);
}

/**
 * 处理单张完整角色立绘。
 */
async function processCharacter(fileName, backupDir) {
  const filePath = path.join(CHARACTER_DIR, fileName);
  const image = sharp(filePath).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const originalBounds = getAlphaBounds(data, info);
  const isHair2 = fileName.startsWith("hair2_");
  const isHair1Shoe = CLEAN_HAIR1_SHOES && isHair1ShoeFile(fileName);
  const normalized = isAlreadyNormalized(info, originalBounds);

  // 已经规范化的文件默认跳过，避免重复处理边缘。
  if (
    !isHair1Shoe &&
    normalized &&
    (!isHair2 || originalBounds.partialPixels > 0) &&
    !FORCE_WRITE
  ) {
    return {
      fileName,
      action: "checked",
      before: { width: info.width, height: info.height, bounds: originalBounds },
      after: null,
      edge: null
    };
  }

  if (!SHOULD_WRITE && !isHair1Shoe) {
    return {
      fileName,
      action: "needs-fix",
      before: { width: info.width, height: info.height, bounds: originalBounds },
      after: null,
      edge: null
    };
  }

  if (isHair1Shoe) {
    const removedHoles = removeHair1ShoeBackgroundHoles(
      data,
      info,
      originalBounds
    );
    // 只有确认存在卷发内部底色块时才处理外轮廓，避免重复运行持续侵蚀发丝。
    const cleanedBoundary =
      removedHoles.removedPixels > 0
        ? cleanHair1ShoeBoundary(data, info, originalBounds)
        : { clearedPixels: 0, softenedPixels: 0 };
    const changedPixels =
      removedHoles.removedPixels +
      cleanedBoundary.clearedPixels +
      cleanedBoundary.softenedPixels;

    if (changedPixels === 0) {
      return {
        fileName,
        action: "checked",
        before: {
          width: info.width,
          height: info.height,
          bounds: originalBounds
        },
        after: null,
        edge: null
      };
    }

    if (!SHOULD_WRITE) {
      return {
        fileName,
        action: "needs-fix",
        before: {
          width: info.width,
          height: info.height,
          bounds: originalBounds
        },
        after: null,
        edge: {
          removedHolePixels: removedHoles.removedPixels,
          removedHoleComponents: removedHoles.removedComponents,
          ...cleanedBoundary
        }
      };
    }

    fs.copyFileSync(filePath, path.join(backupDir, fileName));
    const output = await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: info.channels
      }
    })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();
    writeFileAtomically(filePath, output);

    return {
      fileName,
      action: "fixed",
      before: {
        width: info.width,
        height: info.height,
        bounds: originalBounds
      },
      after: {
        width: info.width,
        height: info.height,
        bounds: getAlphaBounds(data, info)
      },
      edge: {
        removedHolePixels: removedHoles.removedPixels,
        removedHoleComponents: removedHoles.removedComponents,
        ...cleanedBoundary
      }
    };
  }

  fs.copyFileSync(filePath, path.join(backupDir, fileName));

  let edge = null;

  if (isHair2) {
    const removedPixels = keepLargestAlphaComponent(data, info);
    const removedHoles = removeHairBackgroundHoles(
      data,
      info,
      getAlphaBounds(data, info)
    );
    edge = {
      removedPixels,
      removedHolePixels: removedHoles.removedPixels,
      removedHoleComponents: removedHoles.removedComponents,
      ...rebuildHair2Edge(data, info)
    };
  } else {
    // hair1 原图已有可靠抗锯齿，只清空完全透明区域中的无效 RGB。
    for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
      const offset = pixel * info.channels;
      if (data[offset + 3] === 0) {
        data[offset] = 0;
        data[offset + 1] = 0;
        data[offset + 2] = 0;
      }
    }
  }

  const cleanedBounds = getAlphaBounds(data, info);

  if (!cleanedBounds) {
    throw new Error("未检测到有效人物主体");
  }

  const output = await placeOnTargetCanvas(data, info, cleanedBounds);
  writeFileAtomically(filePath, output);

  const { data: outputData, info: outputInfo } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const outputBounds = getAlphaBounds(outputData, outputInfo);

  return {
    fileName,
    action: "fixed",
    before: { width: info.width, height: info.height, bounds: originalBounds },
    after: {
      width: outputInfo.width,
      height: outputInfo.height,
      bounds: outputBounds
    },
    edge
  };
}

/**
 * 打印检查和处理汇总。
 */
function printSummary(results, backupDir) {
  const fixed = results.filter((result) => result.action === "fixed");
  const needsFix = results.filter((result) => result.action === "needs-fix");
  const checked = results.filter((result) => result.action === "checked");
  const failed = results.filter((result) => result.action === "failed");

  console.log("");
  console.log(`目标画布：${TARGET.width}×${TARGET.height}`);
  console.log(
    `目标位置：头顶 y=${TARGET.subjectTop}，脚底 y=${TARGET.subjectBottom}，中心 x=${TARGET.centerX}`
  );
  console.log(`检查总数：${results.length}`);
  console.log(`已符合：${checked.length}`);
  console.log(`需要修复：${needsFix.length}`);
  console.log(`本次修复：${fixed.length}`);
  console.log(`处理失败：${failed.length}`);

  if (backupDir && fixed.length > 0) {
    console.log(`原图备份：${backupDir}`);
  }

  if (needsFix.length > 0) {
    console.log("");
    console.log("待修复文件：");
    needsFix.forEach((result) => console.log(`- ${result.fileName}`));
  }

  if (failed.length > 0) {
    console.log("");
    console.log("处理失败文件：");
    failed.forEach((result) =>
      console.log(`- ${result.fileName}: ${result.error}`)
    );
  }
}

async function main() {
  const files = getCharacterFiles();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = SHOULD_WRITE
    ? path.join(os.tmpdir(), `dress-up-character-backup-${timestamp}`)
    : null;

  if (backupDir) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const results = [];

  for (const fileName of files) {
    try {
      const result = await processCharacter(fileName, backupDir);
      results.push(result);

      if (result.action === "fixed") {
        const bounds = result.after.bounds;
        console.log(
          `已修复 ${fileName}: ${result.after.width}×${result.after.height}, ` +
            `主体 ${bounds.width}×${bounds.height}, ` +
            `位置 (${bounds.left},${bounds.top})-(${bounds.right},${bounds.bottom})`
        );
      }
    } catch (error) {
      results.push({
        fileName,
        action: "failed",
        error: error.message
      });
    }
  }

  printSummary(results, backupDir);

  if (!SHOULD_WRITE && results.some((result) => result.action === "needs-fix")) {
    console.log("");
    console.log("这是检查模式，尚未修改图片。确认后请加入 --write 执行修复。");
  }

  if (results.some((result) => result.action === "failed")) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
