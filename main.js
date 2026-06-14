// localStorage 中保存搭配时使用的键名。
const SAVE_KEY = "dress-up-h5-full-character-outfit";

// localStorage 中保存剧情通关进度时使用的键名。
const STORY_PROGRESS_KEY = "dress-up-h5-passed-story-levels";

// 没有选择任何服装时显示的默认人物立绘。
const BASE_IMAGE = "assets/character/hair1/base/base.png";

// 游戏支持的三个独立背景。
const BACKGROUND_OPTIONS = [
  "assets/bg/bg_01.png",
  "assets/bg/bg_02.png",
  "assets/bg/bg_03.png"
];

// 评分属性的中文名称。
const ATTR_NAME_MAP = {
  sweet: "甜美",
  elegant: "优雅",
  fresh: "清凉",
  cute: "可爱",
  cool: "酷帅",
  daily: "日常",
  gorgeous: "华丽"
};

// 每个类别最多能贡献的分数，防止单件衣物在 100 分制中占比过高。
const CATEGORY_SCORE_LIMITS = {
  dress: 45,
  top: 25,
  bottom: 25,
  shoes: 15,
  hair: 15
};

// 五个评分关卡。评级统一使用 100 分制，passScore 用于显示关卡目标。
const SCORE_LEVELS = [
  {
    id: "level_01",
    name: "甜美约会",
    description: "用甜美和可爱的单品完成约会造型。",
    targetAttrs: ["sweet", "cute"],
    passScore: 75
  },
  {
    id: "level_02",
    name: "职场通勤",
    description: "搭配优雅、日常的成熟通勤造型。",
    targetAttrs: ["elegant", "daily"],
    passScore: 75
  },
  {
    id: "level_03",
    name: "华丽舞会",
    description: "选择华丽且优雅的服饰参加舞会。",
    targetAttrs: ["gorgeous", "elegant"],
    passScore: 80
  },
  {
    id: "level_04",
    name: "清新出游",
    description: "用清凉、日常的搭配迎接轻松出游。",
    targetAttrs: ["fresh", "daily"],
    passScore: 70
  },
  {
    id: "level_05",
    name: "酷帅街拍",
    description: "完成兼具酷帅和日常感的街拍造型。",
    targetAttrs: ["cool", "daily"],
    passScore: 70
  }
];

// 剧情数据由 data/storyLevels.js 提供；缺少文件时使用空数组安全降级。
const storyChapters = Array.isArray(window.STORY_CHAPTERS)
  ? window.STORY_CHAPTERS
  : [];

/*
 * 发型数据。
 * hair1 使用项目原有深色长发立绘，hair2 使用新增金色长卷发立绘。
 */
const HAIR_OPTIONS = {
  hair1: {
    id: "hair1",
    name: "默认深色长发",
    type: "hair",
    baseImage: "assets/character/hair1/base/base.png",
    scorable: false
  },
  hair2: {
    id: "hair2",
    name: "金色长卷发",
    type: "hair",
    baseImage: "assets/character/hair2/base/hair2_base.png",
    thumb: "assets/clothes/hair/hair2_thumb.png",
    primaryAttr: "gorgeous",
    secondaryAttr: "sweet",
    primaryScore: 10,
    secondaryScore: 5,
    scorable: true
  }
};

/*
 * 上装数据。
 * onlyImage 表示只选择这件上装时使用的完整人物立绘。
 */
const TOP_OPTIONS = {
  top1: {
    id: "top1",
    name: "粉色泡泡袖上衣",
    type: "top",
    thumb: "assets/clothes/top/top1_thumb.png",
    onlyImage: "assets/character/hair1/top/top1_only.png",
    primaryAttr: "sweet",
    secondaryAttr: "cute",
    primaryScore: 18,
    secondaryScore: 8
  },
  top2: {
    id: "top2",
    name: "蓝色水手领米色短袖上装",
    type: "top",
    thumb: "assets/clothes/top/top2_thumb.png",
    onlyImage: "assets/character/hair1/top/top2_only.png",
    primaryAttr: "fresh",
    secondaryAttr: "daily",
    primaryScore: 17,
    secondaryScore: 7
  },
  top3: {
    id: "top3",
    name: "OL 风上装",
    type: "top",
    thumb: "assets/clothes/top/top3_thumb.png",
    onlyImage: "assets/character/hair1/top/top3_only.png",
    primaryAttr: "elegant",
    secondaryAttr: "daily",
    primaryScore: 18,
    secondaryScore: 7
  }
};

/*
 * 下装数据。
 * onlyImage 表示只选择这件下装时使用的完整人物立绘。
 */
const BOTTOM_OPTIONS = {
  bottom1: {
    id: "bottom1",
    name: "粉色高腰百褶短裙",
    type: "bottom",
    thumb: "assets/clothes/bottom/bottom1_thumb.png",
    onlyImage: "assets/character/hair1/bottom/bottom1_only.png",
    primaryAttr: "cute",
    secondaryAttr: "sweet",
    primaryScore: 18,
    secondaryScore: 8
  },
  bottom2: {
    id: "bottom2",
    name: "米色高腰短裤",
    type: "bottom",
    thumb: "assets/clothes/bottom/bottom2_thumb.png",
    onlyImage: "assets/character/hair1/bottom/bottom2_only.png",
    primaryAttr: "daily",
    secondaryAttr: "fresh",
    primaryScore: 17,
    secondaryScore: 7
  },
  bottom3: {
    id: "bottom3",
    name: "深色高腰铅笔裙",
    type: "bottom",
    thumb: "assets/clothes/bottom/bottom3_thumb.png",
    onlyImage: "assets/character/hair1/bottom/bottom3_only.png",
    primaryAttr: "elegant",
    secondaryAttr: "cool",
    primaryScore: 18,
    secondaryScore: 7
  }
};

/*
 * 连衣裙是独立类别，选择后会清空上装和下装。
 */
const DRESS_OPTIONS = {
  dress1: {
    id: "dress1",
    name: "粉色蓬蓬连衣裙",
    type: "dress",
    thumb: "assets/clothes/dress/dress1_thumb.png",
    image: "assets/character/hair1/dress/dress1.png",
    primaryAttr: "gorgeous",
    secondaryAttr: "sweet",
    primaryScore: 32,
    secondaryScore: 12
  }
};

/*
 * 鞋子是额外组件，不会清空当前上装、下装或连衣裙。
 */
const SHOES_OPTIONS = {
  shoes1: {
    id: "shoes1",
    name: "粉色玛丽珍鞋",
    type: "shoes",
    thumb: "assets/clothes/shoes/shoes1_thumb.png",
    onlyImage: "assets/character/hair1/shoes1/shoes1_only.png",
    primaryAttr: "cute",
    secondaryAttr: "sweet",
    primaryScore: 10,
    secondaryScore: 5
  },
  shoes2: {
    id: "shoes2",
    name: "裸色尖头低跟鞋",
    type: "shoes",
    thumb: "assets/clothes/shoes/shoes2_thumb.png",
    onlyImage: "assets/character/hair1/shoes2/shoes2_only.png",
    primaryAttr: "elegant",
    secondaryAttr: "daily",
    primaryScore: 10,
    secondaryScore: 5
  }
};

/*
 * hair1 使用项目原有的完整人物立绘路径。
 * 这里先保留旧的四段式 key，随后统一加上 hair1 前缀。
 */
const HAIR1_OUTFIT_PATHS = {
  none_none_none_none: "assets/character/hair1/base/base.png",
  none_none_none_shoes1: "assets/character/hair1/shoes1/shoes1_only.png",
  none_none_none_shoes2: "assets/character/hair1/shoes2/shoes2_only.png",
  top1_none_none_none: "assets/character/hair1/top/top1_only.png",
  top2_none_none_none: "assets/character/hair1/top/top2_only.png",
  top3_none_none_none: "assets/character/hair1/top/top3_only.png",
  top1_none_none_shoes1: "assets/character/hair1/shoes1/top1_shoes1.png",
  top2_none_none_shoes1: "assets/character/hair1/shoes1/top2_shoes1.png",
  top3_none_none_shoes1: "assets/character/hair1/shoes1/top3_shoes1.png",
  top1_none_none_shoes2: "assets/character/hair1/shoes2/top1_shoes2.png",
  top2_none_none_shoes2: "assets/character/hair1/shoes2/top2_shoes2.png",
  top3_none_none_shoes2: "assets/character/hair1/shoes2/top3_shoes2.png",
  none_bottom1_none_none: "assets/character/hair1/bottom/bottom1_only.png",
  none_bottom2_none_none: "assets/character/hair1/bottom/bottom2_only.png",
  none_bottom3_none_none: "assets/character/hair1/bottom/bottom3_only.png",
  none_bottom1_none_shoes1: "assets/character/hair1/shoes1/bottom1_shoes1.png",
  none_bottom2_none_shoes1: "assets/character/hair1/shoes1/bottom2_shoes1.png",
  none_bottom3_none_shoes1: "assets/character/hair1/shoes1/bottom3_shoes1.png",
  none_bottom1_none_shoes2: "assets/character/hair1/shoes2/bottom1_shoes2.png",
  none_bottom2_none_shoes2: "assets/character/hair1/shoes2/bottom2_shoes2.png",
  none_bottom3_none_shoes2: "assets/character/hair1/shoes2/bottom3_shoes2.png",
  top1_bottom1_none_none: "assets/character/hair1/outfit/outfit_top1_bottom1.png",
  top1_bottom2_none_none: "assets/character/hair1/outfit/outfit_top1_bottom2.png",
  top1_bottom3_none_none: "assets/character/hair1/outfit/outfit_top1_bottom3.png",
  top2_bottom1_none_none: "assets/character/hair1/outfit/outfit_top2_bottom1.png",
  top2_bottom2_none_none: "assets/character/hair1/outfit/outfit_top2_bottom2.png",
  top2_bottom3_none_none: "assets/character/hair1/outfit/outfit_top2_bottom3.png",
  top3_bottom1_none_none: "assets/character/hair1/outfit/outfit_top3_bottom1.png",
  top3_bottom2_none_none: "assets/character/hair1/outfit/outfit_top3_bottom2.png",
  top3_bottom3_none_none: "assets/character/hair1/outfit/outfit_top3_bottom3.png",
  top1_bottom1_none_shoes1:
    "assets/character/hair1/outfit-shoes1/outfit_top1_bottom1_shoes1.png",
  top1_bottom2_none_shoes1:
    "assets/character/hair1/outfit-shoes1/outfit_top1_bottom2_shoes1.png",
  top1_bottom3_none_shoes1:
    "assets/character/hair1/outfit-shoes1/outfit_top1_bottom3_shoes1.png",
  top2_bottom1_none_shoes1:
    "assets/character/hair1/outfit-shoes1/outfit_top2_bottom1_shoes1.png",
  top2_bottom2_none_shoes1:
    "assets/character/hair1/outfit-shoes1/outfit_top2_bottom2_shoes1.png",
  top2_bottom3_none_shoes1:
    "assets/character/hair1/outfit-shoes1/outfit_top2_bottom3_shoes1.png",
  top3_bottom1_none_shoes1:
    "assets/character/hair1/outfit-shoes1/outfit_top3_bottom1_shoes1.png",
  top3_bottom2_none_shoes1:
    "assets/character/hair1/outfit-shoes1/outfit_top3_bottom2_shoes1.png",
  top3_bottom3_none_shoes1:
    "assets/character/hair1/outfit-shoes1/outfit_top3_bottom3_shoes1.png",
  top1_bottom1_none_shoes2:
    "assets/character/hair1/outfit-shoes2/outfit_top1_bottom1_shoes2.png",
  top1_bottom2_none_shoes2:
    "assets/character/hair1/outfit-shoes2/outfit_top1_bottom2_shoes2.png",
  top1_bottom3_none_shoes2:
    "assets/character/hair1/outfit-shoes2/outfit_top1_bottom3_shoes2.png",
  top2_bottom1_none_shoes2:
    "assets/character/hair1/outfit-shoes2/outfit_top2_bottom1_shoes2.png",
  top2_bottom2_none_shoes2:
    "assets/character/hair1/outfit-shoes2/outfit_top2_bottom2_shoes2.png",
  top2_bottom3_none_shoes2:
    "assets/character/hair1/outfit-shoes2/outfit_top2_bottom3_shoes2.png",
  top3_bottom1_none_shoes2:
    "assets/character/hair1/outfit-shoes2/outfit_top3_bottom1_shoes2.png",
  top3_bottom2_none_shoes2:
    "assets/character/hair1/outfit-shoes2/outfit_top3_bottom2_shoes2.png",
  top3_bottom3_none_shoes2:
    "assets/character/hair1/outfit-shoes2/outfit_top3_bottom3_shoes2.png",
  none_none_dress1_none: "assets/character/hair1/dress/dress1.png",
  none_none_dress1_shoes1: "assets/character/hair1/shoes1/dress1_shoes1.png",
  none_none_dress1_shoes2: "assets/character/hair1/shoes2/dress1_shoes2.png"
};

/*
 * 所有状态对应的完整人物立绘。
 * key 的格式固定为：发型_上装_下装_连衣裙_鞋子。
 */
const outfitMap = {};

/**
 * 将项目原有立绘注册为 hair1 组合。
 */
function registerHair1Outfits() {
  Object.entries(HAIR1_OUTFIT_PATHS).forEach(([key, path]) => {
    outfitMap[`hair1_${key}`] = path;
  });
}

/**
 * 根据现有文件命名规则注册 hair2 的 51 种完整人物立绘。
 */
function registerHair2Outfits() {
  const topIds = Object.keys(TOP_OPTIONS);
  const bottomIds = Object.keys(BOTTOM_OPTIONS);
  const shoesIds = [null, ...Object.keys(SHOES_OPTIONS)];

  shoesIds.forEach((shoesId) => {
    const shoesKey = shoesId || "none";
    const shoesSuffix = shoesId ? `_${shoesId}` : "";
    const shoesFolder = shoesId || null;

    outfitMap[`hair2_none_none_none_${shoesKey}`] =
      shoesFolder
        ? `assets/character/hair2/${shoesFolder}/hair2_base${shoesSuffix}.png`
        : "assets/character/hair2/base/hair2_base.png";

    topIds.forEach((topId) => {
      outfitMap[`hair2_${topId}_none_none_${shoesKey}`] =
        shoesFolder
          ? `assets/character/hair2/${shoesFolder}/hair2_${topId}${shoesSuffix}.png`
          : `assets/character/hair2/top/hair2_${topId}.png`;
    });

    bottomIds.forEach((bottomId) => {
      outfitMap[`hair2_none_${bottomId}_none_${shoesKey}`] =
        shoesFolder
          ? `assets/character/hair2/${shoesFolder}/hair2_${bottomId}${shoesSuffix}.png`
          : `assets/character/hair2/bottom/hair2_${bottomId}.png`;
    });

    topIds.forEach((topId) => {
      bottomIds.forEach((bottomId) => {
        outfitMap[`hair2_${topId}_${bottomId}_none_${shoesKey}`] =
          shoesFolder
            ? `assets/character/hair2/outfit-${shoesFolder}/hair2_${topId}_${bottomId}${shoesSuffix}.png`
            : `assets/character/hair2/outfit/hair2_${topId}_${bottomId}.png`;
      });
    });

    Object.keys(DRESS_OPTIONS).forEach((dressId) => {
      outfitMap[`hair2_none_none_${dressId}_${shoesKey}`] =
        shoesFolder
          ? `assets/character/hair2/${shoesFolder}/hair2_${dressId}${shoesSuffix}.png`
          : `assets/character/hair2/dress/hair2_${dressId}.png`;
    });
  });
}

registerHair1Outfits();
registerHair2Outfits();

// 获取页面元素。
const homePage = document.querySelector("#homePage");
const storyLevelPage = document.querySelector("#storyLevelPage");
const storyResultPage = document.querySelector("#storyResultPage");
const dressPage = document.querySelector("#dressPage");
const startButton = document.querySelector("#startButton");
const storyModeButton = document.querySelector("#storyModeButton");
const storyBackButton = document.querySelector("#storyBackButton");
const backButton = document.querySelector("#backButton");
const storyChapterName = document.querySelector("#storyChapterName");
const storyChapterDescription = document.querySelector(
  "#storyChapterDescription"
);
const chapterProgress = document.querySelector("#chapterProgress");
const storyLevelList = document.querySelector("#storyLevelList");
const bgImage = document.querySelector("#bgImage");
const characterImage = document.querySelector("#characterImage");
const backgroundOptions = document.querySelector("#backgroundOptions");
const clearButton = document.querySelector("#clearButton");
const saveButton = document.querySelector("#saveButton");
const loadButton = document.querySelector("#loadButton");
const levelSelect = document.querySelector("#levelSelect");
const scoreButton = document.querySelector("#scoreButton");
const scoreResult = document.querySelector("#scoreResult");
const scoreLevelName = document.querySelector("#scoreLevelName");
const scoreTargetAttrs = document.querySelector("#scoreTargetAttrs");
const scoreTotal = document.querySelector("#scoreTotal");
const scoreRank = document.querySelector("#scoreRank");
const scorePassState = document.querySelector("#scorePassState");
const scoreDetails = document.querySelector("#scoreDetails");
const levelSelectLabel = document.querySelector("#levelSelectLabel");
const storyScoreTarget = document.querySelector("#storyScoreTarget");
const storyMissionBanner = document.querySelector("#storyMissionBanner");
const storyMissionName = document.querySelector("#storyMissionName");
const storyMissionAttrs = document.querySelector("#storyMissionAttrs");
const departBtn = document.querySelector("#departBtn");
const storyResultActions = document.querySelector("#storyResultActions");
const successResultView = document.querySelector("#successResultView");
const failResultView = document.querySelector("#failResultView");
const backToChapterBtn = document.querySelector("#backToChapterBtn");
const storyDialog = document.querySelector("#storyDialog");
const storySpeaker = document.querySelector("#storySpeaker");
const storyText = document.querySelector("#storyText");
const storyStepText = document.querySelector("#storyStepText");
const nextStoryButton = document.querySelector("#nextStoryButton");
const toast = document.querySelector("#toast");

// 当前发型 id。默认使用项目原有的深色长发。
let currentHair = "hair1";

// 当前选择的上装 id。没有选择时为 null。
let currentTop = null;

// 当前选择的下装 id。没有选择时为 null。
let currentBottom = null;

// 当前选择的连衣裙 id。连衣裙不能和上装、下装同时存在。
let currentDress = null;

// 当前选择的鞋子 id。鞋子可以和其他服装状态同时存在。
let currentShoes = null;

// 当前背景路径。换装时不会修改这个变量。
let currentBg = BACKGROUND_OPTIONS[0];

// 当前人物立绘路径，用于保存搭配和检查显示状态。
let imagePath = BASE_IMAGE;

// 当前游戏模式：free 表示自由换装，story 表示剧情关卡。
let gameMode = "free";

// 当前正在游玩的剧情关卡；自由换装模式下为 null。
let currentStoryLevel = null;

// 当前正在播放的剧情台词、位置和播放结束后的操作。
let activeStoryLines = [];
let activeStoryIndex = 0;
let activeStoryComplete = null;

// 已通关的剧情关卡 id 集合，会同步保存到 localStorage。
let passedStoryLevels = loadPassedStoryLevels();

// 操作提示的定时器。
let toastTimer = null;

/**
 * 根据发型和四个服装状态生成 outfitMap 使用的 key。
 * 只要选择了连衣裙，就优先使用连衣裙状态。
 */
function getOutfitKey() {
  const hairId = currentHair || "hair1";

  if (currentDress) {
    return `${hairId}_none_none_${currentDress}_${currentShoes || "none"}`;
  }

  return [
    hairId,
    currentTop || "none",
    currentBottom || "none",
    "none",
    currentShoes || "none"
  ].join("_");
}

/**
 * 获取当前发型的基础人物立绘。
 */
function getHairBaseImagePath() {
  const hairId = HAIR_OPTIONS[currentHair] ? currentHair : "hair1";
  return outfitMap[`${hairId}_none_none_none_none`] || BASE_IMAGE;
}

/**
 * 从 outfitMap 中获取当前状态对应的人物立绘路径。
 * 缺少组合时回退到当前发型基础图，并在控制台提示具体 key。
 */
function getCharacterImagePath() {
  const key = getOutfitKey();
  const nextImagePath = outfitMap[key];

  if (!nextImagePath) {
    console.warn("缺少对应立绘：", key);
    return getHairBaseImagePath();
  }

  return nextImagePath;
}

/**
 * 图片文件加载失败时，退回当前发型的基础人物立绘。
 */
function getCharacterFallbackPath() {
  const hairBaseImagePath = getHairBaseImagePath();

  if (imagePath === hairBaseImagePath && hairBaseImagePath !== BASE_IMAGE) {
    return BASE_IMAGE;
  }

  return hairBaseImagePath;
}

/**
 * 更新角色图片。
 * 换装核心只有这一行：替换 characterImage.src，不使用任何服装图层。
 */
function updateCharacterImage() {
  imagePath = getCharacterImagePath();
  characterImage.src = imagePath;
  updateSelectionDisplay();
  hideScoreResult();
}

/**
 * 将 currentBg 应用到独立背景层，并更新背景按钮选中状态。
 */
function updateBackground() {
  bgImage.src = currentBg;

  document.querySelectorAll(".background-button").forEach((button) => {
    const isSelected = button.dataset.bg === currentBg;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

/**
 * 点击背景按钮时只替换背景，不修改任何服装选择状态。
 */
function changeBackground(event) {
  const nextBackground = event.currentTarget.dataset.bg;

  if (!BACKGROUND_OPTIONS.includes(nextBackground)) {
    return;
  }

  currentBg = nextBackground;
  updateBackground();
}

/**
 * 选择或取消上装。
 * 再次点击当前上装时只脱下上装，不影响下装、鞋子、发型和背景。
 */
function selectTop(id) {
  if (!TOP_OPTIONS[id]) {
    return;
  }

  if (currentTop === id) {
    currentTop = null;
  } else {
    currentTop = id;
    currentDress = null;
  }

  updateCharacterImage();
}

/**
 * 选择或取消下装。
 * 再次点击当前下装时只脱下下装，不影响上装、鞋子、发型和背景。
 */
function selectBottom(id) {
  if (!BOTTOM_OPTIONS[id]) {
    return;
  }

  if (currentBottom === id) {
    currentBottom = null;
  } else {
    currentBottom = id;
    currentDress = null;
  }

  updateCharacterImage();
}

/**
 * 选择或取消连衣裙。
 * 穿上连衣裙时清空上装和下装，脱下时保留鞋子、发型和背景。
 */
function selectDress(id) {
  if (!DRESS_OPTIONS[id]) {
    return;
  }

  if (currentDress === id) {
    currentDress = null;
  } else {
    currentDress = id;
    currentTop = null;
    currentBottom = null;
  }

  updateCharacterImage();
}

/**
 * 选择或取消鞋子。
 * 鞋子是额外组件，不会改变发型和其他服装状态。
 */
function selectShoes(id) {
  if (!SHOES_OPTIONS[id]) {
    return;
  }

  currentShoes = currentShoes === id ? null : id;
  updateCharacterImage();
}

/**
 * 选择或取消可选发型。
 * hair1 是默认发型，再次点击 hair2 时恢复 hair1。
 */
function selectHair(id) {
  if (id !== "hair2" || !HAIR_OPTIONS[id]) {
    return;
  }

  currentHair = currentHair === id ? "hair1" : id;
  updateCharacterImage();
}

/**
 * 根据服装按钮的类别，将点击操作交给对应的 toggle 函数。
 */
function handleClothesClick(event) {
  const button = event.currentTarget;
  const type = button.dataset.type;
  const itemId = button.dataset.id;

  if (type === "hair") {
    selectHair(itemId);
    return;
  }

  if (type === "top") {
    selectTop(itemId);
    return;
  }

  if (type === "bottom") {
    selectBottom(itemId);
    return;
  }

  if (type === "dress") {
    selectDress(itemId);
    return;
  }

  if (type === "shoes") {
    selectShoes(itemId);
  }
}

/**
 * 更新衣物按钮的选中状态。
 */
function updateSelectionDisplay() {
  const clothesButtons = document.querySelectorAll(".clothes-card");

  clothesButtons.forEach((button) => {
    const isTopSelected =
      button.dataset.type === "top" && button.dataset.id === currentTop;
    const isHairSelected =
      button.dataset.type === "hair" && button.dataset.id === currentHair;
    const isBottomSelected =
      button.dataset.type === "bottom" && button.dataset.id === currentBottom;
    const isDressSelected =
      button.dataset.type === "dress" && button.dataset.id === currentDress;
    const isShoesSelected =
      button.dataset.type === "shoes" && button.dataset.id === currentShoes;

    const isSelected =
      isHairSelected ||
      isTopSelected ||
      isBottomSelected ||
      isDressSelected ||
      isShoesSelected;

    // 同时保留项目原有 is-active 类，并提供语义更直观的 selected 类。
    button.classList.toggle("is-active", isSelected);
    button.classList.toggle("selected", isSelected);
    button.setAttribute(
      "aria-pressed",
      String(isSelected)
    );
  });
}

/**
 * 从本地读取已通关关卡。
 * 存档异常时返回空数组，避免剧情模式无法打开。
 */
function loadPassedStoryLevels() {
  try {
    const savedProgress = JSON.parse(
      localStorage.getItem(STORY_PROGRESS_KEY) || "[]"
    );

    return Array.isArray(savedProgress) ? savedProgress : [];
  } catch (error) {
    console.warn("剧情进度读取失败，将使用空进度：", error);
    return [];
  }
}

/**
 * 保存剧情通关进度。
 */
function savePassedStoryLevels() {
  try {
    localStorage.setItem(
      STORY_PROGRESS_KEY,
      JSON.stringify(passedStoryLevels)
    );
  } catch (error) {
    console.error("剧情进度保存失败：", error);
    showToast("通关成功，但进度保存失败");
  }
}

/**
 * 获取目前开放的第一章数据。
 */
function getFirstStoryChapter() {
  return storyChapters[0] || null;
}

/**
 * 将已通过的关卡加入本地进度；重复通关不会重复保存 id。
 */
function markStoryLevelPassed(levelId) {
  if (passedStoryLevels.includes(levelId)) {
    return;
  }

  passedStoryLevels.push(levelId);
  savePassedStoryLevels();
}

/**
 * 渲染第一章四个关卡，并显示未通关或已通关状态。
 */
function renderStoryLevelList() {
  const chapter = getFirstStoryChapter();

  if (!chapter) {
    storyLevelList.innerHTML =
      '<p class="score-detail-empty">剧情数据暂时无法读取。</p>';
    chapterProgress.textContent = "0 / 0 已通关";
    return;
  }

  storyChapterName.textContent = chapter.chapterName;
  storyChapterDescription.textContent = chapter.description;

  const passedCount = chapter.levels.filter((level) =>
    passedStoryLevels.includes(level.levelId)
  ).length;
  chapterProgress.textContent = `${passedCount} / ${chapter.levels.length} 已通关`;

  storyLevelList.innerHTML = chapter.levels
    .map((level) => {
      const isPassed = passedStoryLevels.includes(level.levelId);
      const attrText = level.targetAttrs
        .map((attr) => ATTR_NAME_MAP[attr] || attr)
        .join(" / ");

      return `
        <button
          class="story-level-card${isPassed ? " is-passed" : ""}"
          type="button"
          data-story-level-id="${level.levelId}"
        >
          <span class="story-level-card-heading">
            <strong>${level.levelName}</strong>
            <span class="story-level-status">${isPassed ? "已通关" : "未通关"}</span>
          </span>
          <p>根据场合提示，完成符合目标属性的造型。</p>
          <span class="story-level-meta">
            <span>目标属性：${attrText}</span>
          </span>
        </button>
      `;
    })
    .join("");

  storyLevelList
    .querySelectorAll("[data-story-level-id]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        startStoryLevel(button.dataset.storyLevelId);
      });
    });
}

/**
 * 根据 levelId 查找剧情关卡。
 */
function findStoryLevel(levelId) {
  for (const chapter of storyChapters) {
    const level = chapter.levels.find((item) => item.levelId === levelId);
    if (level) return level;
  }

  return null;
}

/**
 * 更新换装页的剧情任务提示。
 * 自由换装模式隐藏任务栏，剧情模式只显示关卡名、目标属性和出发按钮。
 */
function updateGameModeUI() {
  const isStoryMode = gameMode === "story" && currentStoryLevel;

  storyMissionBanner.classList.toggle("is-hidden", !isStoryMode);

  if (isStoryMode) {
    const attrs = currentStoryLevel.targetAttrs
      .map((attr) => ATTR_NAME_MAP[attr] || attr)
      .join(" / ");

    storyMissionName.textContent = currentStoryLevel.levelName;
    storyMissionAttrs.textContent = attrs;
  }

  hideScoreResult();
}

/**
 * 显示当前剧情台词。
 */
function renderStoryLine() {
  const line = activeStoryLines[activeStoryIndex];

  if (!line) {
    return;
  }

  storySpeaker.textContent = line.speaker;
  storyText.textContent = line.text;
  storyStepText.textContent =
    `${activeStoryIndex + 1} / ${activeStoryLines.length}`;
  nextStoryButton.textContent =
    activeStoryIndex === activeStoryLines.length - 1 ? "完成" : "下一句";
}

/**
 * 打开剧情弹窗并从第一句开始播放。
 */
function playStory(lines, onComplete) {
  if (!Array.isArray(lines) || lines.length === 0) {
    if (typeof onComplete === "function") onComplete();
    return;
  }

  activeStoryLines = lines;
  activeStoryIndex = 0;
  activeStoryComplete =
    typeof onComplete === "function" ? onComplete : null;
  storyDialog.classList.remove("is-hidden");
  renderStoryLine();
}

/**
 * 点击“下一句”推进剧情，最后一句结束后执行对应流程。
 */
function advanceStory() {
  if (activeStoryIndex < activeStoryLines.length - 1) {
    activeStoryIndex += 1;
    renderStoryLine();
    return;
  }

  storyDialog.classList.add("is-hidden");
  const complete = activeStoryComplete;
  activeStoryLines = [];
  activeStoryIndex = 0;
  activeStoryComplete = null;

  if (complete) complete();
}

/**
 * 重置剧情关卡中的穿搭状态。
 * 只清空当前人物搭配，不修改背景、自由换装存档或剧情通关进度。
 */
function resetStoryOutfit() {
  currentHair = "hair1";
  currentTop = null;
  currentBottom = null;
  currentDress = null;
  currentShoes = null;

  // 更新基础人物立绘，同时清除所有衣物按钮的选中高亮。
  updateCharacterImage();
}

/**
 * 选择剧情关卡后先播放开场剧情，播放完毕再进入换装页。
 */
function startStoryLevel(levelId) {
  const level = findStoryLevel(levelId);

  if (!level) {
    showToast("找不到该剧情关卡");
    return;
  }

  gameMode = "story";
  currentStoryLevel = level;
  resetStoryOutfit();
  updateGameModeUI();
  playStory(level.introStory, showDressPage);
}

/**
 * 根据类别和 id 获取当前项目中的衣物评分数据。
 */
function getClothingData(type, id) {
  const optionMaps = {
    hair: HAIR_OPTIONS,
    top: TOP_OPTIONS,
    bottom: BOTTOM_OPTIONS,
    dress: DRESS_OPTIONS,
    shoes: SHOES_OPTIONS
  };
  const optionMap = optionMaps[type];
  const item = optionMap && optionMap[id];

  if (!item) {
    console.warn(`找不到评分衣物数据：${type}/${id}`);
    return null;
  }

  return item;
}

/**
 * 获取当前需要参与评分的衣物。
 * 连衣裙存在时不计算上装和下装，默认 hair1 不参与评分。
 */
function getCurrentScoringItems() {
  const items = [];

  if (currentDress) {
    const dress = getClothingData("dress", currentDress);
    if (dress) items.push(dress);
  } else {
    if (currentTop) {
      const top = getClothingData("top", currentTop);
      if (top) items.push(top);
    }

    if (currentBottom) {
      const bottom = getClothingData("bottom", currentBottom);
      if (bottom) items.push(bottom);
    }
  }

  if (currentShoes) {
    const shoes = getClothingData("shoes", currentShoes);
    if (shoes) items.push(shoes);
  }

  if (currentHair && currentHair !== "hair1") {
    const hair = getClothingData("hair", currentHair);
    if (hair && hair.scorable !== false) items.push(hair);
  }

  return items;
}

/**
 * 计算单件衣物在当前关卡中的命中分。
 * 原始命中分超过类别权重时，按该类别的最高权重计分。
 */
function calculateItemScore(item, level) {
  const contributions = [
    {
      attr: item.primaryAttr,
      score: item.primaryScore,
      matched: level.targetAttrs.includes(item.primaryAttr)
    },
    {
      attr: item.secondaryAttr,
      score: item.secondaryScore,
      matched: level.targetAttrs.includes(item.secondaryAttr)
    }
  ];
  const rawScore = contributions.reduce(
    (sum, contribution) =>
      contribution.matched ? sum + contribution.score : sum,
    0
  );
  const categoryLimit = CATEGORY_SCORE_LIMITS[item.type] || 100;

  return {
    item,
    contributions,
    rawScore,
    categoryLimit,
    score: Math.min(rawScore, categoryLimit)
  };
}

/**
 * 根据 100 分制返回 S、A、B、C 评级。
 */
function getScoreRank(totalScore) {
  if (totalScore >= 90) return "S";
  if (totalScore >= 75) return "A";
  if (totalScore >= 60) return "B";
  return "C";
}

/**
 * 计算当前穿搭总分，最终结果严格限制在 0 到 100。
 */
function calculateOutfitScore(level) {
  const details = getCurrentScoringItems().map((item) =>
    calculateItemScore(item, level)
  );
  const scoreSum = details.reduce((sum, detail) => sum + detail.score, 0);
  const totalScore = Math.max(0, Math.min(scoreSum, 100));

  return {
    totalScore,
    rank: getScoreRank(totalScore),
    passed: totalScore >= level.passScore,
    details
  };
}

/**
 * 将评分明细显示到页面结果区域。
 */
function renderScoreResult(level, result) {
  scoreLevelName.textContent = level.name;
  scoreTargetAttrs.textContent = level.targetAttrs
    .map((attr) => ATTR_NAME_MAP[attr] || attr)
    .join(" / ");
  scoreTotal.textContent = String(result.totalScore);
  scoreRank.textContent = result.rank;
  scoreRank.dataset.rank = result.rank;
  scorePassState.textContent = result.passed
    ? "已达到关卡要求"
    : "本次搭配尚未达到关卡要求";
  scorePassState.classList.toggle("is-passed", result.passed);

  if (result.details.length === 0) {
    scoreDetails.innerHTML =
      '<li class="score-detail-empty">当前没有选择可评分的服饰，本次得分为 0。</li>';
  } else {
    scoreDetails.innerHTML = result.details
      .map((detail) => {
        const matchedContributions = detail.contributions.filter(
          (contribution) => contribution.matched
        );
        const contributionHtml =
          matchedContributions.length > 0
            ? matchedContributions
                .map(
                  (contribution) =>
                    `<span>${ATTR_NAME_MAP[contribution.attr] || contribution.attr} +${contribution.score}</span>`
                )
                .join("")
            : "<span>本关未命中属性，+0</span>";
        const limitNote =
          detail.rawScore > detail.categoryLimit
            ? `<small>原始命中 ${detail.rawScore} 分，按${detail.item.type === "top" ? "上装" : detail.item.type === "bottom" ? "下装" : detail.item.type === "dress" ? "连衣裙" : detail.item.type === "shoes" ? "鞋子" : "发型"}上限 ${detail.categoryLimit} 分计入</small>`
            : "";

        return `
          <li>
            <div class="score-detail-heading">
              <strong>${detail.item.name}</strong>
              <b>+${detail.score}</b>
            </div>
            <div class="score-contributions">${contributionHtml}</div>
            ${limitNote}
          </li>
        `;
      })
      .join("");
  }

  scoreResult.classList.remove("is-hidden");
}

/**
 * 获取当前要评分的关卡。
 * 剧情模式把 targetScore 转成现有评分函数使用的 passScore。
 */
function getActiveScoreLevel() {
  if (gameMode === "story" && currentStoryLevel) {
    return {
      id: currentStoryLevel.levelId,
      name: currentStoryLevel.levelName,
      targetAttrs: currentStoryLevel.targetAttrs,
      passScore: currentStoryLevel.targetScore
    };
  }

  return SCORE_LEVELS.find((item) => item.id === levelSelect.value) || null;
}

/**
 * 点击“开始评分”后，读取当前关卡并计算穿搭分数。
 */
function scoreCurrentOutfit() {
  const level = getActiveScoreLevel();

  if (!level) {
    console.warn("找不到当前评分关卡：", levelSelect.value);
    showToast("评分关卡不存在");
    return;
  }

  renderScoreResult(level, calculateOutfitScore(level));
}

/**
 * 显示剧情关卡的最终成功或失败页面。
 */
function showStoryFinalResult(passed) {
  hideAllPages();
  successResultView.classList.toggle("is-hidden", !passed);
  failResultView.classList.toggle("is-hidden", passed);
  storyResultPage.classList.remove("is-hidden");
}

/**
 * 点击“出发”后复用现有 100 分制计算，并直接播放成功或失败剧情。
 * 分数只用于内部判定，不在剧情模式界面中展示。
 */
function departStoryLevel() {
  if (gameMode !== "story" || !currentStoryLevel) {
    return;
  }

  const level = getActiveScoreLevel();
  const result = calculateOutfitScore(level);

  console.log("剧情关卡评分：", {
    levelId: currentStoryLevel.levelId,
    totalScore: result.totalScore,
    passed: result.passed
  });

  if (result.passed) {
    markStoryLevelPassed(currentStoryLevel.levelId);
    playStory(currentStoryLevel.successStory, () => {
      showStoryFinalResult(true);
    });
    return;
  }

  playStory(currentStoryLevel.failStory, () => {
    showStoryFinalResult(false);
  });
}

/**
 * 穿搭发生变化后隐藏旧评分，避免把旧结果误认为当前结果。
 */
function hideScoreResult() {
  if (scoreResult) {
    scoreResult.classList.add("is-hidden");
  }

  if (storyResultActions) {
    storyResultActions.classList.add("is-hidden");
  }
}

/**
 * 将五个评分关卡填充到下拉框。
 */
function populateLevelSelect() {
  levelSelect.innerHTML = SCORE_LEVELS.map(
    (level) => `<option value="${level.id}">${level.name}</option>`
  ).join("");
}

/**
 * 清空当前搭配，并恢复默认人物立绘。
 */
function clearOutfit() {
  currentHair = "hair1";
  currentTop = null;
  currentBottom = null;
  currentDress = null;
  currentShoes = null;
  updateCharacterImage();
  showToast("搭配已清空");
}

/**
 * 保存当前发型、上装、下装、连衣裙、鞋子和背景。
 */
function saveOutfit() {
  const outfitData = {
    currentHair,
    currentTop,
    currentBottom,
    currentDress,
    currentShoes,
    currentBg
  };

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(outfitData));
    showToast("搭配保存成功");
  } catch (error) {
    console.error("保存搭配失败：", error);
    showToast("搭配保存失败");
  }
}

/**
 * 读取上次保存的搭配。
 * 读取后重新调用 updateCharacterImage()，不直接相信存档中的图片路径。
 */
function loadOutfit() {
  const savedText = localStorage.getItem(SAVE_KEY);

  if (!savedText) {
    showToast("还没有保存过搭配");
    return;
  }

  try {
    const savedOutfit = JSON.parse(savedText);

    // 只恢复数据表中真实存在的服装 id，避免错误存档导致页面异常。
    const savedDress =
      savedOutfit.currentDress && DRESS_OPTIONS[savedOutfit.currentDress]
        ? savedOutfit.currentDress
        : null;
    const savedShoes =
      savedOutfit.currentShoes && SHOES_OPTIONS[savedOutfit.currentShoes]
        ? savedOutfit.currentShoes
        : null;
    const savedHair =
      savedOutfit.currentHair && HAIR_OPTIONS[savedOutfit.currentHair]
        ? savedOutfit.currentHair
        : "hair1";

    // 旧存档没有 currentHair 时默认恢复为 hair1。
    currentHair = savedHair;

    // 鞋子与其他类别兼容，也支持读取旧版不含 currentShoes 的存档。
    currentShoes = savedShoes;

    // 连衣裙存档优先，恢复后必须清空上装和下装。
    if (savedDress) {
      currentDress = savedDress;
      currentTop = null;
      currentBottom = null;
    } else {
      currentDress = null;
      currentTop =
        savedOutfit.currentTop && TOP_OPTIONS[savedOutfit.currentTop]
          ? savedOutfit.currentTop
          : null;

      currentBottom =
        savedOutfit.currentBottom && BOTTOM_OPTIONS[savedOutfit.currentBottom]
          ? savedOutfit.currentBottom
          : null;
    }

    currentBg = BACKGROUND_OPTIONS.includes(savedOutfit.currentBg)
      ? savedOutfit.currentBg
      : BACKGROUND_OPTIONS[0];

    // 分别恢复人物立绘和背景，二者互不影响。
    updateCharacterImage();
    updateBackground();
    showToast("已读取上次搭配");
  } catch (error) {
    console.error("读取搭配失败：", error);
    showToast("存档格式有误");
  }
}

/**
 * 显示短暂的操作提示。
 */
function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1800);
}

/**
 * 隐藏所有主页面，供页面切换函数复用。
 */
function hideAllPages() {
  homePage.classList.add("is-hidden");
  storyLevelPage.classList.add("is-hidden");
  storyResultPage.classList.add("is-hidden");
  dressPage.classList.add("is-hidden");
}

/**
 * 进入换装页，并根据当前模式更新评分目标。
 */
function showDressPage() {
  hideAllPages();
  dressPage.classList.remove("is-hidden");
  updateGameModeUI();
}

/**
 * 从首页进入自由换装模式。
 */
function startFreeMode() {
  gameMode = "free";
  currentStoryLevel = null;
  showDressPage();
}

/**
 * 显示剧情关卡选择页并刷新本地通关状态。
 */
function showStoryLevelPage() {
  gameMode = "story";
  hideAllPages();
  renderStoryLevelList();
  storyLevelPage.classList.remove("is-hidden");
}

/**
 * 返回首页时退出当前剧情关卡，但不会清除通关进度或穿搭。
 */
function showHomePage() {
  gameMode = "free";
  currentStoryLevel = null;
  hideAllPages();
  homePage.classList.remove("is-hidden");
  updateGameModeUI();
}

/**
 * 换装页返回按钮：剧情模式回关卡列表，自由模式回首页。
 */
function handleDressBack() {
  if (gameMode === "story" && currentStoryLevel) {
    showStoryLevelPage();
    return;
  }

  showHomePage();
}

/**
 * 点击分类按钮时，只显示对应类别的服装列表。
 */
function changeCategory(event) {
  const selectedCategory = event.currentTarget.dataset.category;

  document.querySelectorAll(".category-button").forEach((button) => {
    const isSelected = button.dataset.category === selectedCategory;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-selected", String(isSelected));
  });

  document.querySelectorAll(".category-panel").forEach((panel) => {
    panel.classList.toggle(
      "is-hidden",
      panel.dataset.categoryPanel !== selectedCategory
    );
  });
}

/**
 * 给服装分类按钮绑定点击事件。
 */
function bindCategoryEvents() {
  document.querySelectorAll(".category-button").forEach((button) => {
    button.addEventListener("click", changeCategory);
  });
}

/**
 * 给发型、上装、下装、连衣裙和鞋子按钮绑定点击事件。
 */
function bindClothesEvents() {
  const clothesButtons = document.querySelectorAll(".clothes-card");

  clothesButtons.forEach((button) => {
    button.addEventListener("click", handleClothesClick);
  });
}

/**
 * 给三个背景按钮绑定点击事件。
 */
function bindBackgroundEvents() {
  const backgroundButtons =
    backgroundOptions.querySelectorAll(".background-button");

  backgroundButtons.forEach((button) => {
    button.addEventListener("click", changeBackground);
  });
}

/**
 * 缩略图不存在时隐藏损坏图片，保留可点击的文字服装按钮。
 */
function bindThumbnailFallbacks() {
  document.querySelectorAll(".thumbnail-box img").forEach((image) => {
    image.addEventListener("error", () => {
      image.hidden = true;
      image.parentElement.classList.add("is-missing");
    });
  });
}

/**
 * 初始化页面事件和默认人物状态。
 */
function initGame() {
  startButton.addEventListener("click", startFreeMode);
  storyModeButton.addEventListener("click", showStoryLevelPage);
  storyBackButton.addEventListener("click", showHomePage);
  backButton.addEventListener("click", handleDressBack);
  clearButton.addEventListener("click", clearOutfit);
  saveButton.addEventListener("click", saveOutfit);
  loadButton.addEventListener("click", loadOutfit);
  departBtn.addEventListener("click", departStoryLevel);
  backToChapterBtn.addEventListener("click", showStoryLevelPage);
  nextStoryButton.addEventListener("click", advanceStory);

  bindCategoryEvents();
  bindClothesEvents();
  bindBackgroundEvents();
  bindThumbnailFallbacks();
  populateLevelSelect();
  renderStoryLevelList();
  updateGameModeUI();
  updateCharacterImage();
  updateBackground();

  // 对应图片文件缺失时给出警告，并退回当前发型基础立绘。
  characterImage.addEventListener("error", () => {
    const missingImagePath = imagePath;
    const fallbackPath = getCharacterFallbackPath();

    console.warn("缺少对应立绘：", getOutfitKey(), missingImagePath);

    if (missingImagePath !== fallbackPath) {
      imagePath = fallbackPath;
      characterImage.src = fallbackPath;
    }
  });

  bgImage.addEventListener("error", () => {
    console.error(`背景图片加载失败：${currentBg}`);
  });
}

// 页面加载后启动游戏。
initGame();
