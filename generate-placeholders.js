/*
 * 生成项目自带的示意 PNG。
 * 这些图片只是帮助初学者理解分层规则，可以随时用正式美术素材覆盖。
 * 运行方式：node scripts/generate-placeholders.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const projectRoot = path.resolve(__dirname, "..");
const imageJobs = [];

function svg(content, background = "") {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
      ${background}
      ${content}
    </svg>
  `;
}

function roundedRect(x, y, width, height, radius, fill, stroke = "none", strokeWidth = 0) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}"
    fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
}

function writePng(relativePath, svgText) {
  const outputPath = path.join(projectRoot, relativePath);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  imageJobs.push(sharp(Buffer.from(svgText)).png().toFile(outputPath));
}

// 人物身体：服装图片要以这张图的人物位置为基准进行绘制。
const body = `
  <ellipse cx="300" cy="178" rx="78" ry="86" fill="#ffd9c7" stroke="#754d55" stroke-width="5"/>
  <circle cx="272" cy="174" r="6" fill="#5c4248"/>
  <circle cx="328" cy="174" r="6" fill="#5c4248"/>
  <path d="M283 211 Q300 225 317 211" fill="none" stroke="#d46c78" stroke-width="5" stroke-linecap="round"/>
  ${roundedRect(274, 252, 52, 62, 18, "#ffd9c7", "#754d55", 4)}
  ${roundedRect(220, 295, 160, 220, 60, "#ffd9c7", "#754d55", 5)}
  ${roundedRect(180, 310, 52, 250, 25, "#ffd9c7", "#754d55", 5)}
  ${roundedRect(368, 310, 52, 250, 25, "#ffd9c7", "#754d55", 5)}
  ${roundedRect(240, 490, 58, 220, 25, "#ffd9c7", "#754d55", 5)}
  ${roundedRect(302, 490, 58, 220, 25, "#ffd9c7", "#754d55", 5)}
  <ellipse cx="263" cy="716" rx="42" ry="20" fill="#ffd9c7" stroke="#754d55" stroke-width="5"/>
  <ellipse cx="337" cy="716" rx="42" ry="20" fill="#ffd9c7" stroke="#754d55" stroke-width="5"/>
`;

writePng("assets/character/body.png", svg(body));

// 三张背景图。
writePng(
  "assets/bg/bg-1.png",
  svg(
    `
      <circle cx="500" cy="110" r="70" fill="#ffd5e3" opacity="0.8"/>
      <path d="M0 610 Q150 540 300 620 T600 610 V800 H0Z" fill="#e6b9c8"/>
      <rect x="70" y="110" width="180" height="230" rx="22" fill="#fff7fb" stroke="#eaa3bb" stroke-width="10"/>
      <path d="M160 110 V340 M70 225 H250" stroke="#eaa3bb" stroke-width="8"/>
      <circle cx="470" cy="440" r="52" fill="#ff829e"/>
      <path d="M440 398 Q470 352 500 398" fill="#7fbd78"/>
    `,
    '<rect width="600" height="800" fill="#f9dfE8"/>'
  )
);

writePng(
  "assets/bg/bg-2.png",
  svg(
    `
      <circle cx="505" cy="110" r="58" fill="#ffe278"/>
      <g fill="#ffffff" opacity="0.9">
        <ellipse cx="135" cy="135" rx="80" ry="35"/>
        <ellipse cx="195" cy="130" rx="60" ry="28"/>
      </g>
      <path d="M0 560 Q120 500 240 565 T480 555 T720 560 V800 H0Z" fill="#92d59b"/>
      <g fill="#fff4a8">
        <circle cx="80" cy="630" r="15"/><circle cx="520" cy="600" r="15"/>
        <circle cx="450" cy="700" r="15"/><circle cx="130" cy="735" r="15"/>
      </g>
    `,
    '<rect width="600" height="800" fill="#bde9f4"/>'
  )
);

writePng(
  "assets/bg/bg-3.png",
  svg(
    `
      <defs>
        <radialGradient id="stageGlow">
          <stop offset="0" stop-color="#fff5dc"/>
          <stop offset="1" stop-color="#8b75c9"/>
        </radialGradient>
      </defs>
      <rect width="600" height="800" fill="url(#stageGlow)"/>
      <path d="M0 0 L145 0 Q95 240 145 520 L0 610Z" fill="#6f438e"/>
      <path d="M600 0 L455 0 Q505 240 455 520 L600 610Z" fill="#6f438e"/>
      <ellipse cx="300" cy="760" rx="245" ry="80" fill="#dbc9ef"/>
      <g fill="#fff2a8">
        <circle cx="95" cy="100" r="8"/><circle cx="505" cy="140" r="8"/>
        <circle cx="170" cy="80" r="6"/><circle cx="450" cy="220" r="6"/>
      </g>
    `
  )
);

// 发型图层。中间留空露出脸部。
const hairItems = [
  {
    file: "hair-1.png",
    color: "#72452f",
    content: `
      <path d="M214 165 Q216 72 300 70 Q390 72 388 175 L370 300 L335 278 L346 145
        Q300 105 254 145 L265 278 L230 300Z" fill="#72452f" stroke="#553226" stroke-width="6"/>
    `
  },
  {
    file: "hair-2.png",
    color: "#eb86a8",
    content: `
      <path d="M215 170 Q215 72 300 70 Q392 72 390 178 L370 245 L342 218 L348 145
        Q300 108 252 145 L258 218 L228 245Z" fill="#eb86a8" stroke="#b9567b" stroke-width="6"/>
      <path d="M248 105 Q275 155 350 126" fill="none" stroke="#f7b1c9" stroke-width="18"/>
    `
  },
  {
    file: "hair-3.png",
    color: "#f4c75f",
    content: `
      <path d="M218 170 Q215 70 300 68 Q390 72 386 170 L360 218 L342 145
        Q300 105 254 145 L238 218Z" fill="#f4c75f" stroke="#c79532" stroke-width="6"/>
      <path d="M232 170 Q165 190 190 330 Q220 300 247 220Z" fill="#f4c75f" stroke="#c79532" stroke-width="6"/>
      <path d="M368 170 Q435 190 410 330 Q380 300 353 220Z" fill="#f4c75f" stroke="#c79532" stroke-width="6"/>
      <circle cx="220" cy="178" r="18" fill="#ef7998"/><circle cx="380" cy="178" r="18" fill="#ef7998"/>
    `
  }
];

hairItems.forEach((item) => {
  writePng(`assets/clothes/hair/${item.file}`, svg(item.content));
});

const tops = [
  {
    file: "top-1.png",
    color: "#ef718c",
    detail: `
      <circle cx="278" cy="370" r="7" fill="#fff"/>
      <circle cx="322" cy="410" r="7" fill="#fff"/>
      <path d="M280 320 Q300 350 320 320" fill="none" stroke="#fff" stroke-width="7"/>
    `
  },
  {
    file: "top-2.png",
    color: "#9275d0",
    detail: '<path d="M265 330 Q300 380 335 330" fill="none" stroke="#d8cef2" stroke-width="12"/>'
  },
  {
    file: "top-3.png",
    color: "#71add6",
    detail: `
      <path d="M230 360 H370 M230 405 H370 M230 450 H370" stroke="#d6efff" stroke-width="12"/>
    `
  }
];

tops.forEach((item) => {
  writePng(
    `assets/clothes/top/${item.file}`,
    svg(`
      ${roundedRect(215, 292, 170, 215, 52, item.color, "#5f5260", 5)}
      ${roundedRect(177, 310, 58, 175, 28, item.color, "#5f5260", 5)}
      ${roundedRect(365, 310, 58, 175, 28, item.color, "#5f5260", 5)}
      ${item.detail}
    `)
  );
});

const bottoms = [
  {
    file: "bottom-1.png",
    content: `
      <path d="M225 485 H375 L410 610 Q300 645 190 610Z" fill="#e96891" stroke="#684e5c" stroke-width="6"/>
      <path d="M245 495 L235 615 M285 495 L280 625 M325 495 L330 625 M365 495 L375 615"
        stroke="#f7abc2" stroke-width="7"/>
    `
  },
  {
    file: "bottom-2.png",
    content: `
      <path d="M225 485 H375 L365 690 H305 L300 550 L295 690 H235Z"
        fill="#548dbb" stroke="#3e5f78" stroke-width="6"/>
      <path d="M300 490 V555 M235 540 H365" stroke="#a9d0ea" stroke-width="6"/>
    `
  },
  {
    file: "bottom-3.png",
    content: `
      <path d="M225 485 H375 L425 675 Q300 715 175 675Z"
        fill="#f3dfb4" stroke="#8e795c" stroke-width="6"/>
      <path d="M208 620 Q300 650 392 620" fill="none" stroke="#fff5dd" stroke-width="14"/>
    `
  }
];

bottoms.forEach((item) => {
  writePng(`assets/clothes/bottom/${item.file}`, svg(item.content));
});

const shoes = [
  { file: "shoes-1.png", color: "#d95062", sole: "#743c46" },
  { file: "shoes-2.png", color: "#f9f8f5", sole: "#8293a0" },
  { file: "shoes-3.png", color: "#78569e", sole: "#49365d" }
];

shoes.forEach((item, index) => {
  const bootHeight = index === 2 ? 70 : 38;
  writePng(
    `assets/clothes/shoes/${item.file}`,
    svg(`
      <path d="M225 ${714 - bootHeight} H292 V725 Q255 747 210 728Z"
        fill="${item.color}" stroke="${item.sole}" stroke-width="6"/>
      <path d="M308 ${714 - bootHeight} H375 L390 728 Q345 747 308 725Z"
        fill="${item.color}" stroke="${item.sole}" stroke-width="6"/>
      <path d="M214 728 H292 M308 728 H386" stroke="${item.sole}" stroke-width="9"/>
    `)
  );
});

const accessories = [
  {
    file: "accessory-1.png",
    content: `
      <path d="M236 115 L245 137 L270 138 L251 154 L257 178 L236 164 L215 178
        L221 154 L202 138 L227 137Z" fill="#ffe26f" stroke="#b48928" stroke-width="5"/>
    `
  },
  {
    file: "accessory-2.png",
    content: `
      <path d="M265 278 Q300 330 335 278" fill="none" stroke="#e5bf43" stroke-width="6"/>
      <path d="M300 320 C278 300 267 338 300 356 C333 338 322 300 300 320Z"
        fill="#e85879" stroke="#a53954" stroke-width="4"/>
    `
  },
  {
    file: "accessory-3.png",
    content: `
      ${roundedRect(395, 430, 120, 135, 26, "#f19abb", "#8f5369", 6)}
      <path d="M415 435 Q455 355 495 435" fill="none" stroke="#8f5369" stroke-width="10"/>
      <path d="M455 470 C420 438 405 488 455 512 C505 488 490 438 455 470Z"
        fill="#fff0f5" stroke="#b66682" stroke-width="5"/>
    `
  }
];

accessories.forEach((item) => {
  writePng(`assets/clothes/accessory/${item.file}`, svg(item.content));
});

Promise.all(imageJobs)
  .then(() => {
    console.log("占位 PNG 已生成。");
  })
  .catch((error) => {
    console.error("生成失败：", error);
    process.exitCode = 1;
  });
