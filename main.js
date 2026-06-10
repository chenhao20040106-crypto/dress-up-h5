// localStorage 中保存搭配时使用的键名。
const SAVE_KEY = "dress-up-h5-full-character-outfit";

// 没有选择任何服装时显示的默认人物立绘。
const BASE_IMAGE = "assets/character/base.png";

// 游戏支持的三个独立背景。
const BACKGROUND_OPTIONS = [
  "assets/bg/bg_01.png",
  "assets/bg/bg_02.png",
  "assets/bg/bg_03.png"
];

/*
 * 上装数据。
 * onlyImage 表示只选择这件上装时使用的完整人物立绘。
 */
const TOP_OPTIONS = {
  top1: {
    id: "top1",
    name: "粉色蝴蝶结上衣",
    onlyImage: "assets/character/top1_only.png"
  },
  top2: {
    id: "top2",
    name: "蓝色学院风上衣",
    onlyImage: "assets/character/top2_only.png"
  },
  top3: {
    id: "top3",
    name: "粉色领结白衬衫",
    onlyImage: "assets/character/top3_only.png"
  }
};

/*
 * 下装数据。
 * onlyImage 表示只选择这件下装时使用的完整人物立绘。
 */
const BOTTOM_OPTIONS = {
  bottom1: {
    id: "bottom1",
    name: "百褶短裙",
    onlyImage: "assets/character/bottom1_only.png"
  },
  bottom2: {
    id: "bottom2",
    name: "奶油色短裤",
    onlyImage: "assets/character/bottom2_only.png"
  },
  bottom3: {
    id: "bottom3",
    name: "深蓝通勤半身裙",
    onlyImage: "assets/character/bottom3_only.png"
  }
};

/*
 * 连衣裙是独立类别，选择后会清空上装和下装。
 */
const DRESS_OPTIONS = {
  dress1: {
    id: "dress1",
    name: "甜心蝴蝶结连衣裙",
    image: "assets/character/dress1.png"
  }
};

/*
 * 所有状态对应的完整人物立绘。
 * key 的格式固定为：上装_下装_连衣裙。
 */
const outfitMap = {
  none_none_none: "assets/character/base.png",
  top1_none_none: "assets/character/top1_only.png",
  top2_none_none: "assets/character/top2_only.png",
  top3_none_none: "assets/character/top3_only.png",
  none_bottom1_none: "assets/character/bottom1_only.png",
  none_bottom2_none: "assets/character/bottom2_only.png",
  none_bottom3_none: "assets/character/bottom3_only.png",
  top1_bottom1_none: "assets/character/outfit_top1_bottom1.png",
  top1_bottom2_none: "assets/character/outfit_top1_bottom2.png",
  top1_bottom3_none: "assets/character/outfit_top1_bottom3.png",
  top2_bottom1_none: "assets/character/outfit_top2_bottom1.png",
  top2_bottom2_none: "assets/character/outfit_top2_bottom2.png",
  top2_bottom3_none: "assets/character/outfit_top2_bottom3.png",
  top3_bottom1_none: "assets/character/outfit_top3_bottom1.png",
  top3_bottom2_none: "assets/character/outfit_top3_bottom2.png",
  top3_bottom3_none: "assets/character/outfit_top3_bottom3.png",
  none_none_dress1: "assets/character/dress1.png"
};

// 获取页面元素。
const homePage = document.querySelector("#homePage");
const dressPage = document.querySelector("#dressPage");
const startButton = document.querySelector("#startButton");
const backButton = document.querySelector("#backButton");
const bgImage = document.querySelector("#bgImage");
const characterImage = document.querySelector("#characterImage");
const backgroundOptions = document.querySelector("#backgroundOptions");
const currentTopText = document.querySelector("#currentTopText");
const currentBottomText = document.querySelector("#currentBottomText");
const currentDressText = document.querySelector("#currentDressText");
const clearButton = document.querySelector("#clearButton");
const saveButton = document.querySelector("#saveButton");
const loadButton = document.querySelector("#loadButton");
const toast = document.querySelector("#toast");

// 当前选择的上装 id。没有选择时为 null。
let currentTop = null;

// 当前选择的下装 id。没有选择时为 null。
let currentBottom = null;

// 当前选择的连衣裙 id。连衣裙不能和上装、下装同时存在。
let currentDress = null;

// 当前背景路径。换装时不会修改这个变量。
let currentBg = BACKGROUND_OPTIONS[0];

// 当前人物立绘路径，用于保存搭配和检查显示状态。
let imagePath = BASE_IMAGE;

// 操作提示的定时器。
let toastTimer = null;

/**
 * 根据三个服装状态生成 outfitMap 使用的 key。
 * 只要选择了连衣裙，就优先使用连衣裙状态。
 */
function getOutfitKey() {
  if (currentDress) {
    return `none_none_${currentDress}`;
  }

  return `${currentTop || "none"}_${currentBottom || "none"}_none`;
}

/**
 * 从 outfitMap 中获取当前状态对应的人物立绘路径。
 */
function getCharacterImagePath() {
  return outfitMap[getOutfitKey()] || BASE_IMAGE;
}

/**
 * 更新角色图片。
 * 换装核心只有这一行：替换 characterImage.src，不使用任何服装图层。
 */
function updateCharacterImage() {
  imagePath = getCharacterImagePath();
  characterImage.src = imagePath;
  updateSelectionDisplay();
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
 * 点击服装按钮后更新状态。
 * 上装、下装会取消连衣裙；连衣裙会清空上装和下装。
 */
function handleClothesClick(event) {
  const button = event.currentTarget;
  const type = button.dataset.type;
  const itemId = button.dataset.id;

  if (type === "top" && TOP_OPTIONS[itemId]) {
    currentDress = null;
    currentTop = itemId;
  }

  if (type === "bottom" && BOTTOM_OPTIONS[itemId]) {
    currentDress = null;
    currentBottom = itemId;
  }

  if (type === "dress" && DRESS_OPTIONS[itemId]) {
    currentDress = itemId;
    currentTop = null;
    currentBottom = null;
  }

  updateCharacterImage();
}

/**
 * 更新按钮选中状态，以及角色下方的文字说明。
 */
function updateSelectionDisplay() {
  const clothesButtons = document.querySelectorAll(".clothes-card");

  clothesButtons.forEach((button) => {
    const isTopSelected =
      button.dataset.type === "top" && button.dataset.id === currentTop;
    const isBottomSelected =
      button.dataset.type === "bottom" && button.dataset.id === currentBottom;
    const isDressSelected =
      button.dataset.type === "dress" && button.dataset.id === currentDress;

    const isSelected =
      isTopSelected || isBottomSelected || isDressSelected;

    button.classList.toggle("is-active", isSelected);
    button.setAttribute(
      "aria-pressed",
      String(isSelected)
    );
  });

  currentTopText.textContent = currentTop
    ? TOP_OPTIONS[currentTop].name
    : "未选择";

  currentBottomText.textContent = currentBottom
    ? BOTTOM_OPTIONS[currentBottom].name
    : "未选择";

  currentDressText.textContent = currentDress
    ? DRESS_OPTIONS[currentDress].name
    : "未选择";
}

/**
 * 清空当前搭配，并恢复默认人物立绘。
 */
function clearOutfit() {
  currentTop = null;
  currentBottom = null;
  currentDress = null;
  updateCharacterImage();
  showToast("搭配已清空");
}

/**
 * 保存当前上装、下装、连衣裙和背景。
 */
function saveOutfit() {
  const outfitData = {
    currentTop,
    currentBottom,
    currentDress,
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
 * 从首页进入换装页。
 */
function showDressPage() {
  homePage.classList.add("is-hidden");
  dressPage.classList.remove("is-hidden");
}

/**
 * 从换装页返回首页。
 */
function showHomePage() {
  dressPage.classList.add("is-hidden");
  homePage.classList.remove("is-hidden");
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
 * 给上装、下装和连衣裙按钮绑定点击事件。
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
  startButton.addEventListener("click", showDressPage);
  backButton.addEventListener("click", showHomePage);
  clearButton.addEventListener("click", clearOutfit);
  saveButton.addEventListener("click", saveOutfit);
  loadButton.addEventListener("click", loadOutfit);

  bindCategoryEvents();
  bindClothesEvents();
  bindBackgroundEvents();
  bindThumbnailFallbacks();
  updateCharacterImage();
  updateBackground();

  // 如果图片路径写错，给初学者一个清晰的控制台提示。
  characterImage.addEventListener("error", () => {
    console.error(`人物立绘加载失败：${imagePath}`);
  });

  bgImage.addEventListener("error", () => {
    console.error(`背景图片加载失败：${currentBg}`);
  });
}

// 页面加载后启动游戏。
initGame();
