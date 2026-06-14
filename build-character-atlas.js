const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const projectRoot = path.resolve(__dirname, "..");
const sourceDir = path.join(projectRoot, "assets", "character");
const outputDir = path.join(projectRoot, "assets", "atlases");

const frameWidth = 1086;
const frameHeight = 1448;
const columns = 4;
const framesPerAtlas = 26;
const webpOptions = {
  quality: 86,
  alphaQuality: 100,
  effort: 6,
  smartSubsample: true
};

/**
 * 根据现有完整立绘文件命名规则，生成 outfit key 与源文件的对应关系。
 */
function buildSourceMap() {
  const sourceMap = {};
  const topIds = ["top1", "top2", "top3"];
  const bottomIds = ["bottom1", "bottom2", "bottom3"];
  const shoesIds = [null, "shoes1", "shoes2"];

  shoesIds.forEach((shoesId) => {
    const shoesKey = shoesId || "none";
    const shoesSuffix = shoesId ? `_${shoesId}` : "";

    sourceMap[`hair1_none_none_none_${shoesKey}`] = shoesId
      ? `${shoesId}_only.png`
      : "base.png";

    sourceMap[`hair2_none_none_none_${shoesKey}`] =
      `hair2_base${shoesSuffix}.png`;

    topIds.forEach((topId) => {
      sourceMap[`hair1_${topId}_none_none_${shoesKey}`] = shoesId
        ? `${topId}_${shoesId}.png`
        : `${topId}_only.png`;
      sourceMap[`hair2_${topId}_none_none_${shoesKey}`] =
        `hair2_${topId}${shoesSuffix}.png`;
    });

    bottomIds.forEach((bottomId) => {
      sourceMap[`hair1_none_${bottomId}_none_${shoesKey}`] = shoesId
        ? `${bottomId}_${shoesId}.png`
        : `${bottomId}_only.png`;
      sourceMap[`hair2_none_${bottomId}_none_${shoesKey}`] =
        `hair2_${bottomId}${shoesSuffix}.png`;
    });

    topIds.forEach((topId) => {
      bottomIds.forEach((bottomId) => {
        sourceMap[`hair1_${topId}_${bottomId}_none_${shoesKey}`] =
          `outfit_${topId}_${bottomId}${shoesSuffix}.png`;
        sourceMap[`hair2_${topId}_${bottomId}_none_${shoesKey}`] =
          `hair2_${topId}_${bottomId}${shoesSuffix}.png`;
      });
    });

    sourceMap[`hair1_none_none_dress1_${shoesKey}`] =
      `dress1${shoesSuffix}.png`;
    sourceMap[`hair2_none_none_dress1_${shoesKey}`] =
      `hair2_dress1${shoesSuffix}.png`;
  });

  return sourceMap;
}

/**
 * 检查所有源立绘尺寸与透明通道，防止图集生成后出现偏移或底色。
 */
async function validateSources(sourceMap) {
  const errors = [];

  for (const [key, filename] of Object.entries(sourceMap)) {
    const sourcePath = path.join(sourceDir, filename);

    if (!fs.existsSync(sourcePath)) {
      errors.push(`${key}: 缺少 ${filename}`);
      continue;
    }

    const metadata = await sharp(sourcePath).metadata();

    if (
      metadata.width !== frameWidth ||
      metadata.height !== frameHeight ||
      !metadata.hasAlpha
    ) {
      errors.push(
        `${filename}: 需要 ${frameWidth}x${frameHeight} RGBA，当前为 ` +
          `${metadata.width}x${metadata.height}, alpha=${metadata.hasAlpha}`
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(`图集源素材检查失败：\n${errors.join("\n")}`);
  }
}

/**
 * 生成透明 WebP 图集，以及 JSON/JS 两种运行时映射。
 */
async function buildAtlases() {
  const sourceMap = buildSourceMap();
  const entries = Object.entries(sourceMap).sort(([keyA], [keyB]) =>
    keyA.localeCompare(keyB)
  );

  if (entries.length !== 102) {
    throw new Error(`预期 102 个 outfit key，实际生成 ${entries.length} 个`);
  }

  await validateSources(sourceMap);
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });

  const atlasMap = {};
  const atlasCount = Math.ceil(entries.length / framesPerAtlas);

  for (let atlasIndex = 0; atlasIndex < atlasCount; atlasIndex += 1) {
    const chunk = entries.slice(
      atlasIndex * framesPerAtlas,
      (atlasIndex + 1) * framesPerAtlas
    );
    const rows = Math.ceil(chunk.length / columns);
    const atlasFilename = `character-atlas-${atlasIndex + 1}.webp`;
    const atlasRelativePath = `assets/atlases/${atlasFilename}`;
    const atlasPath = path.join(outputDir, atlasFilename);
    const composites = [];

    chunk.forEach(([key, filename], frameIndex) => {
      const column = frameIndex % columns;
      const row = Math.floor(frameIndex / columns);
      const x = column * frameWidth;
      const y = row * frameHeight;

      composites.push({
        input: path.join(sourceDir, filename),
        left: x,
        top: y
      });

      atlasMap[key] = {
        atlas: atlasRelativePath,
        x,
        y,
        w: frameWidth,
        h: frameHeight
      };
    });

    await sharp({
      create: {
        width: columns * frameWidth,
        height: rows * frameHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      },
      limitInputPixels: false
    })
      .composite(composites)
      .webp(webpOptions)
      .toFile(atlasPath);
  }

  const jsonText = `${JSON.stringify(atlasMap, null, 2)}\n`;
  fs.writeFileSync(
    path.join(outputDir, "character-atlas.json"),
    jsonText,
    "utf8"
  );
  fs.writeFileSync(
    path.join(outputDir, "character-atlas.js"),
    `window.CHARACTER_ATLAS_MAP = ${jsonText.trim()};\n`,
    "utf8"
  );

  console.log(
    `已生成 ${atlasCount} 个图集，包含 ${entries.length} 个角色 frame。`
  );
}

buildAtlases().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
