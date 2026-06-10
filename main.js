// localStorage 中保存搭配时使用的键名。
const SAVE_KEY = "dress-up-h5-outfit";

// localStorage 中保存金币与本地衣柜的键名。
const COIN_KEY = "dress-up-h5-coin";
const OWNED_CLOTHES_KEY = "dress-up-h5-owned-clothes";

// 游戏支持的服装类型及其中文名称。
const TYPE_NAMES = {
  hair: "发型",
  top: "上衣",
  bottom: "下装",
  shoes: "鞋子",
  accessory: "饰品"
};

// 分类的固定显示顺序。
const TYPE_ORDER = ["hair", "top", "bottom", "shoes", "accessory"];

// 获取页面中的主要元素。
const homePage = document.querySelector("#homePage");
const shopPage = document.querySelector("#shopPage");
const storyPage = document.querySelector("#storyPage");
const dressPage = document.querySelector("#dressPage");
const startButton = document.querySelector("#startButton");
const shopButton = document.querySelector("#shopButton");
const dressShopButton = document.querySelector("#dressShopButton");
const shopBackButton = document.querySelector("#shopBackButton");
const shopCategoryTabs = document.querySelector("#shopCategoryTabs");
const shopList = document.querySelector("#shopList");
const ownedCount = document.querySelector("#ownedCount");
const coinAmountElements = document.querySelectorAll(".coin-amount");
const storyModeButton = document.querySelector("#storyModeButton");
const backButton = document.querySelector("#backButton");
const storyBackButton = document.querySelector("#storyBackButton");
const storyPageTitle = document.querySelector("#storyPageTitle");
const chapterSelectView = document.querySelector("#chapterSelectView");
const chapterList = document.querySelector("#chapterList");
const dialogueView = document.querySelector("#dialogueView");
const storyChapterLabel = document.querySelector("#storyChapterLabel");
const storyChapterTitle = document.querySelector("#storyChapterTitle");
const dialogueAvatar = document.querySelector("#dialogueAvatar");
const dialogueSpeaker = document.querySelector("#dialogueSpeaker");
const dialogueText = document.querySelector("#dialogueText");
const dialogueProgress = document.querySelector("#dialogueProgress");
const nextDialogueButton = document.querySelector("#nextDialogueButton");
const categoryTabs = document.querySelector("#categoryTabs");
const clothesList = document.querySelector("#clothesList");
const backgroundButtons = document.querySelector("#backgroundButtons");
const clearButton = document.querySelector("#clearButton");
const saveButton = document.querySelector("#saveButton");
const loadButton = document.querySelector("#loadButton");
const toast = document.querySelector("#toast");
const levelSelect = document.querySelector("#levelSelect");
const levelTitle = document.querySelector("#levelTitle");
const levelDescription = document.querySelector("#levelDescription");
const levelTags = document.querySelector("#levelTags");
const levelPassScore = document.querySelector("#levelPassScore");
const scoreButton = document.querySelector("#scoreButton");
const scoreModal = document.querySelector("#scoreModal");
const closeScoreButton = document.querySelector("#closeScoreButton");
const confirmScoreButton = document.querySelector("#confirmScoreButton");
const scoreGrade = document.querySelector("#scoreGrade");
const scoreTotal = document.querySelector("#scoreTotal");
const scorePassText = document.querySelector("#scorePassText");
const scoreDetails = document.querySelector("#scoreDetails");

// 每个服装类型对应一个角色图层。
const layerElements = {
  hair: document.querySelector("#layer-hair"),
  top: document.querySelector("#layer-top"),
  bottom: document.querySelector("#layer-bottom"),
  shoes: document.querySelector("#layer-shoes"),
  accessory: document.querySelector("#layer-accessory")
};

// 获取背景图层。
const backgroundLayer = document.querySelector("#layer-bg");

// 保存从 clothes.json 中读取的全部服装。
let clothesData = [];

// 保存从 clothes.json 中读取的背景。
let backgroundsData = [];

// 保存从 levels.json 中读取的全部评分关卡。
let levelsData = [];

// 保存从 story.json 中读取的全部剧情章节。
let storyData = [];

// 当前正在浏览的服装分类。
let activeType = "hair";

// 当前正在浏览的商店分类，all 表示全部分类。
let activeShopType = "all";

// 记录商店返回时应回到首页还是换装页。
let shopReturnPage = "home";

// 当前选择的评分关卡 id。
let activeLevelId = null;

// 当前正在播放的剧情章节。
let activeChapter = null;

// 当前剧情台词在章节中的位置。
let dialogueIndex = 0;

// 提示信息定时器。
let toastTimer = null;

// 玩家当前拥有的金币，首次游戏默认为 1000。
let coin = 1000;

// 玩家已经拥有的服装 id 列表。
let ownedClothes = [];

// 当前穿着状态，各分类保存对应服装图片路径。
const currentOutfit = {
  hair: null,
  top: null,
  bottom: null,
  shoes: null,
  accessory: null,
  bg: "assets/bg/bg_01.png"
};

/**
 * 初始化游戏：同时加载服装、关卡和剧情数据，然后渲染全部游戏界面。
 */
async function initGame() {
  try {
    const [clothesResponse, levelsResponse, storyResponse] = await Promise.all([
      fetch("./data/clothes.json"),
      fetch("./data/levels.json"),
      fetch("./data/story.json")
    ]);

    if (!clothesResponse.ok) {
      throw new Error(`服装数据加载失败：${clothesResponse.status}`);
    }

    if (!levelsResponse.ok) {
      throw new Error(`关卡数据加载失败：${levelsResponse.status}`);
    }

    if (!storyResponse.ok) {
      throw new Error(`剧情数据加载失败：${storyResponse.status}`);
    }

    const [clothesJson, levelsJson, storyJson] = await Promise.all([
      clothesResponse.json(),
      levelsResponse.json(),
      storyResponse.json()
    ]);

    clothesData = normalizeClothesData(clothesJson);
    backgroundsData = normalizeBackgroundData(clothesJson);
    levelsData = normalizeLevelsData(levelsJson);
    storyData = normalizeStoryData(storyJson);
    loadInventory();

    const availableTypes = getAvailableTypes();
    activeType = availableTypes.includes(activeType) ? activeType : availableTypes[0];
    activeLevelId = levelsData[0]?.levelId || null;

    renderCategoryButtons();
    renderClothesList();
    renderShopCategoryButtons();
    renderShopList();
    updateInventoryDisplay();
    renderBackgroundButtons();
    renderLevelSelect();
    renderActiveLevel();
    renderChapterList();
    applyCurrentOutfit();
  } catch (error) {
    console.error(error);
    showToast("游戏数据加载失败，请通过本地服务器运行游戏");
  }
}

/**
 * 将 JSON 中的分类数据整理成统一的服装数组。
 * 同时兼容数组格式和 categories/items 格式。
 */
function normalizeClothesData(jsonData) {
  if (Array.isArray(jsonData)) {
    return jsonData;
  }

  if (Array.isArray(jsonData.clothes)) {
    return jsonData.clothes;
  }

  if (Array.isArray(jsonData.categories)) {
    return jsonData.categories.flatMap((category) => {
      return Array.isArray(category.items) ? category.items : [];
    });
  }

  return [];
}

/**
 * 从 JSON 中读取背景数据；没有背景数据时提供默认的三个背景。
 */
function normalizeBackgroundData(jsonData) {
  if (Array.isArray(jsonData.backgrounds) && jsonData.backgrounds.length > 0) {
    return jsonData.backgrounds.map((background, index) => {
      return {
        id: background.id || `bg_${String(index + 1).padStart(2, "0")}`,
        name: background.name || `背景 ${index + 1}`,
        src: background.src || background.image
      };
    });
  }

  return [
    { id: "bg_01", name: "背景 1", src: "assets/bg/bg_01.png" },
    { id: "bg_02", name: "背景 2", src: "assets/bg/bg_02.png" },
    { id: "bg_03", name: "背景 3", src: "assets/bg/bg_03.png" }
  ];
}

/**
 * 将 levels.json 整理成统一的关卡数组。
 */
function normalizeLevelsData(jsonData) {
  if (Array.isArray(jsonData)) {
    return jsonData;
  }

  if (Array.isArray(jsonData.levels)) {
    return jsonData.levels;
  }

  return [];
}

/**
 * 将 story.json 整理成统一的剧情章节数组。
 */
function normalizeStoryData(jsonData) {
  if (Array.isArray(jsonData)) {
    return jsonData;
  }

  if (Array.isArray(jsonData.chapters)) {
    return jsonData.chapters;
  }

  return [];
}

/**
 * 渲染剧情模式中的章节选择卡片。
 */
function renderChapterList() {
  chapterList.innerHTML = "";

  storyData.forEach((chapter, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chapter-card";
    button.dataset.chapterId = chapter.chapterId;
    button.setAttribute("aria-label", `开始${chapter.title}`);

    const number = document.createElement("span");
    number.className = "chapter-number";
    number.textContent = `CHAPTER ${String(index + 1).padStart(2, "0")}`;

    const title = document.createElement("h3");
    title.textContent = chapter.title;

    const description = document.createElement("p");
    description.textContent = chapter.description;

    const level = levelsData.find((item) => item.levelId === chapter.levelId);
    const levelName = document.createElement("span");
    levelName.className = "chapter-level";
    levelName.textContent = `对应关卡：${level?.title || chapter.levelId}`;

    button.append(number, title, description, levelName);
    button.addEventListener("click", handleChapterClick);
    chapterList.appendChild(button);
  });
}

/**
 * 处理章节卡片点击并开始播放对应剧情。
 */
function handleChapterClick(event) {
  const chapterId = event.currentTarget.dataset.chapterId;
  const chapter = storyData.find((item) => item.chapterId === chapterId);

  if (!chapter) {
    showToast("没有找到这个剧情章节");
    return;
  }

  startChapter(chapter);
}

/**
 * 从第一句开始播放选中的剧情章节。
 */
function startChapter(chapter) {
  activeChapter = chapter;
  dialogueIndex = 0;
  storyPageTitle.textContent = "剧情对话";
  chapterSelectView.classList.add("is-hidden");
  dialogueView.classList.remove("is-hidden");
  renderDialogue();
}

/**
 * 渲染当前章节中的一条台词。
 */
function renderDialogue() {
  const dialogue = activeChapter?.dialogues?.[dialogueIndex];

  if (!dialogue) {
    enterStoryLevel();
    return;
  }

  storyChapterLabel.textContent = `CHAPTER ${activeChapter.chapterId.split("_").pop()}`;
  storyChapterTitle.textContent = activeChapter.title;
  dialogueAvatar.src = dialogue.avatar;
  dialogueAvatar.alt = `${dialogue.speaker}头像`;
  dialogueSpeaker.textContent = dialogue.speaker;
  dialogueText.textContent = dialogue.text;
  dialogueProgress.textContent = `${dialogueIndex + 1} / ${activeChapter.dialogues.length}`;
  nextDialogueButton.textContent =
    dialogueIndex === activeChapter.dialogues.length - 1 ? "进入换装" : "下一句";
}

/**
 * 点击“下一句”时推进台词，最后一句结束后进入绑定关卡。
 */
function advanceDialogue() {
  if (!activeChapter) {
    return;
  }

  const isLastDialogue = dialogueIndex >= activeChapter.dialogues.length - 1;

  if (isLastDialogue) {
    enterStoryLevel();
    return;
  }

  dialogueIndex += 1;
  renderDialogue();
}

/**
 * 剧情结束后切换到章节绑定的换装关卡。
 */
function enterStoryLevel() {
  if (!activeChapter) {
    return;
  }

  const targetLevel = levelsData.find((level) => level.levelId === activeChapter.levelId);

  if (!targetLevel) {
    showToast("章节绑定的关卡不存在");
    return;
  }

  activeLevelId = targetLevel.levelId;
  renderLevelSelect();
  renderActiveLevel();
  showDressPage();
  showToast(`进入关卡：${targetLevel.title}`);
}

/**
 * 将剧情页面恢复到章节选择状态。
 */
function showChapterSelect() {
  activeChapter = null;
  dialogueIndex = 0;
  storyPageTitle.textContent = "选择章节";
  dialogueView.classList.add("is-hidden");
  chapterSelectView.classList.remove("is-hidden");
}

/**
 * 处理剧情页面的返回按钮：对话中返回章节列表，列表中返回首页。
 */
function handleStoryBack() {
  if (!dialogueView.classList.contains("is-hidden")) {
    showChapterSelect();
    return;
  }

  showHomePage();
}

/**
 * 根据服装数据中的 type 字段获取当前存在的分类。
 */
function getAvailableTypes() {
  const typeSet = new Set();

  for (const item of clothesData) {
    if (TYPE_ORDER.includes(item.type)) {
      typeSet.add(item.type);
    }
  }

  return TYPE_ORDER.filter((type) => typeSet.has(type));
}

/**
 * 获取每类第一件服装，作为新玩家的初始衣柜。
 */
function getInitialOwnedClothes() {
  return TYPE_ORDER.map((type) => {
    return clothesData.find((item) => item.type === type)?.id;
  }).filter(Boolean);
}

/**
 * 从 localStorage 读取金币与衣柜；首次游戏时创建默认库存。
 */
function loadInventory() {
  const savedCoin = localStorage.getItem(COIN_KEY);
  const savedOwnedClothes = localStorage.getItem(OWNED_CLOTHES_KEY);
  const validClothesIds = new Set(clothesData.map((item) => item.id));
  const initialOwnedClothes = getInitialOwnedClothes();

  if (savedCoin === null || savedOwnedClothes === null) {
    coin = 1000;
    ownedClothes = initialOwnedClothes;
    saveInventory();
    return;
  }

  try {
    const parsedCoin = Number(savedCoin);
    const parsedOwnedClothes = JSON.parse(savedOwnedClothes);

    coin = Number.isFinite(parsedCoin) && parsedCoin >= 0 ? parsedCoin : 1000;
    ownedClothes = Array.isArray(parsedOwnedClothes)
      ? parsedOwnedClothes.filter((id) => validClothesIds.has(id))
      : [];

    // 兼容旧存档，确保每类第一件基础服装始终免费拥有。
    ownedClothes = [...new Set([...initialOwnedClothes, ...ownedClothes])];
    saveInventory();
  } catch (error) {
    console.error(error);
    coin = 1000;
    ownedClothes = initialOwnedClothes;
    saveInventory();
  }
}

/**
 * 将金币和已拥有服装分别保存到 localStorage。
 */
function saveInventory() {
  localStorage.setItem(COIN_KEY, String(coin));
  localStorage.setItem(OWNED_CLOTHES_KEY, JSON.stringify(ownedClothes));
}

/**
 * 判断一件服装是否已经在玩家的本地衣柜中。
 */
function isClothesOwned(itemId) {
  return ownedClothes.includes(itemId);
}

/**
 * 更新首页、换装页和商店中的金币与衣柜数量。
 */
function updateInventoryDisplay() {
  coinAmountElements.forEach((element) => {
    element.textContent = String(coin);
  });

  ownedCount.textContent = `已拥有 ${ownedClothes.length} / ${clothesData.length}`;
}

/**
 * 根据服装 type 渲染分类按钮。
 */
function renderCategoryButtons() {
  categoryTabs.innerHTML = "";

  for (const type of getAvailableTypes()) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-tab";
    button.dataset.type = type;
    button.textContent = TYPE_NAMES[type] || type;
    button.classList.toggle("is-active", type === activeType);
    button.addEventListener("click", handleCategoryClick);
    categoryTabs.appendChild(button);
  }
}

/**
 * 处理分类按钮点击，只渲染被点击分类的服装。
 */
function handleCategoryClick(event) {
  activeType = event.currentTarget.dataset.type;
  renderCategoryButtons();
  renderClothesList();
}

/**
 * 渲染当前分类的服装列表。
 */
function renderClothesList() {
  clothesList.innerHTML = "";

  const filteredClothes = clothesData.filter((item) => {
    return item.type === activeType && isClothesOwned(item.id);
  });

  for (const item of filteredClothes) {
    clothesList.appendChild(createClothesButton(item));
  }
}

/**
 * 创建单件服装按钮，并显示缩略图与名称。
 */
function createClothesButton(item) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "clothes-button";
  button.dataset.itemId = item.id;
  button.setAttribute("aria-label", `选择${item.name}`);
  button.classList.toggle("is-active", currentOutfit[item.type] === item.src);

  const preview = document.createElement("span");
  preview.className = "clothes-preview";

  const image = document.createElement("img");
  image.src = item.thumbnail || item.src;
  image.alt = item.name;

  const name = document.createElement("span");
  name.className = "clothes-name";
  name.textContent = item.name;

  preview.appendChild(image);
  button.append(preview, name);
  button.addEventListener("click", handleClothesClick);

  return button;
}

/**
 * 处理服装按钮点击，根据服装 id 找到数据并穿到角色身上。
 */
function handleClothesClick(event) {
  const itemId = event.currentTarget.dataset.itemId;
  const selectedItem = clothesData.find((item) => item.id === itemId);

  if (!selectedItem) {
    return;
  }

  wearClothes(selectedItem);
}

/**
 * 穿上指定服装，并替换对应图层图片。
 */
function wearClothes(item) {
  if (!layerElements[item.type] || !isClothesOwned(item.id)) {
    return;
  }

  currentOutfit[item.type] = item.src;
  updateLayer(item.type, item.src);
  renderClothesList();
}

/**
 * 渲染商店分类按钮，商店额外提供“全部”分类。
 */
function renderShopCategoryButtons() {
  shopCategoryTabs.innerHTML = "";
  const shopTypes = ["all", ...getAvailableTypes()];

  for (const type of shopTypes) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-tab";
    button.dataset.type = type;
    button.textContent = type === "all" ? "全部" : TYPE_NAMES[type];
    button.classList.toggle("is-active", type === activeShopType);
    button.addEventListener("click", handleShopCategoryClick);
    shopCategoryTabs.appendChild(button);
  }
}

/**
 * 切换商店分类并只显示对应分类的未拥有服装。
 */
function handleShopCategoryClick(event) {
  activeShopType = event.currentTarget.dataset.type;
  renderShopCategoryButtons();
  renderShopList();
}

/**
 * 渲染商店列表，已经拥有的服装不会再次出现。
 */
function renderShopList() {
  shopList.innerHTML = "";

  const unownedClothes = clothesData.filter((item) => {
    const matchesType = activeShopType === "all" || item.type === activeShopType;
    return matchesType && !isClothesOwned(item.id);
  });

  if (unownedClothes.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "shop-empty";
    emptyMessage.textContent = "这个分类的服装已经全部收入衣柜啦。";
    shopList.appendChild(emptyMessage);
    return;
  }

  for (const item of unownedClothes) {
    shopList.appendChild(createShopItem(item));
  }
}

/**
 * 创建一张商店服装卡片。
 */
function createShopItem(item) {
  const card = document.createElement("article");
  card.className = "shop-item";

  const image = document.createElement("img");
  image.className = "shop-item-image";
  image.src = item.thumbnail || item.src;
  image.alt = item.name;

  const name = document.createElement("h4");
  name.textContent = item.name;

  const type = document.createElement("p");
  type.className = "shop-item-type";
  type.textContent = TYPE_NAMES[item.type] || item.type;

  const buyButton = document.createElement("button");
  buyButton.type = "button";
  buyButton.className = "buy-button";
  buyButton.dataset.itemId = item.id;
  buyButton.textContent = `${item.price} 金币`;
  buyButton.setAttribute("aria-label", `购买${item.name} ${item.price}金币`);
  buyButton.addEventListener("click", handleBuyClothes);

  card.append(image, name, type, buyButton);
  return card;
}

/**
 * 处理购买按钮点击，根据服装 id 执行购买。
 */
function handleBuyClothes(event) {
  const itemId = event.currentTarget.dataset.itemId;
  const item = clothesData.find((clothes) => clothes.id === itemId);

  if (item) {
    buyClothes(item);
  }
}

/**
 * 购买服装：金币足够时扣款并加入衣柜，否则提示金币不足。
 */
function buyClothes(item) {
  if (isClothesOwned(item.id)) {
    showToast("这件服装已经在衣柜中");
    return;
  }

  const price = Number(item.price) || 0;

  if (coin < price) {
    showToast("金币不足");
    return;
  }

  coin -= price;
  ownedClothes.push(item.id);
  saveInventory();
  updateInventoryDisplay();
  renderShopList();
  renderClothesList();
  showToast(`购买成功：${item.name}`);
}

/**
 * 更新一个角色图层；路径为空时隐藏该图层。
 */
function updateLayer(type, src) {
  const layer = layerElements[type];

  if (!layer) {
    return;
  }

  if (src) {
    layer.src = src;
    layer.style.display = "block";
  } else {
    layer.removeAttribute("src");
    layer.style.display = "none";
  }
}

/**
 * 将 currentOutfit 中保存的状态应用到全部角色图层。
 */
function applyCurrentOutfit() {
  for (const type of TYPE_ORDER) {
    updateLayer(type, currentOutfit[type]);
  }

  backgroundLayer.src = currentOutfit.bg;
}

/**
 * 渲染背景切换按钮。
 */
function renderBackgroundButtons() {
  backgroundButtons.innerHTML = "";

  for (const background of backgroundsData) {
    if (!background.src) {
      continue;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "background-button";
    button.dataset.bgSrc = background.src;
    button.title = background.name;
    button.setAttribute("aria-label", `切换到${background.name}`);
    button.classList.toggle("is-active", currentOutfit.bg === background.src);

    const image = document.createElement("img");
    image.src = background.src;
    image.alt = "";

    button.appendChild(image);
    button.addEventListener("click", handleBackgroundClick);
    backgroundButtons.appendChild(button);
  }
}

/**
 * 处理背景按钮点击并替换背景图层。
 */
function handleBackgroundClick(event) {
  changeBackground(event.currentTarget.dataset.bgSrc);
}

/**
 * 设置当前背景并刷新背景按钮状态。
 */
function changeBackground(src) {
  if (!src) {
    return;
  }

  currentOutfit.bg = src;
  backgroundLayer.src = src;
  renderBackgroundButtons();
}

/**
 * 渲染关卡选择下拉框。
 */
function renderLevelSelect() {
  levelSelect.innerHTML = "";

  for (const level of levelsData) {
    const option = document.createElement("option");
    option.value = level.levelId;
    option.textContent = level.title;
    option.selected = level.levelId === activeLevelId;
    levelSelect.appendChild(option);
  }
}

/**
 * 处理关卡选择变化，并刷新当前主题说明。
 */
function handleLevelChange(event) {
  activeLevelId = event.currentTarget.value;
  renderActiveLevel();
}

/**
 * 获取当前正在挑战的关卡。
 */
function getActiveLevel() {
  return levelsData.find((level) => level.levelId === activeLevelId) || null;
}

/**
 * 将英文风格标签转换成中文，方便玩家阅读。
 */
function getTagName(tag) {
  const tagNames = {
    sweet: "甜美",
    cool: "酷感",
    elegant: "优雅",
    cute: "可爱",
    daily: "日常",
    party: "派对"
  };

  return tagNames[tag] || tag;
}

/**
 * 渲染当前关卡的标题、说明、目标标签和过关分。
 */
function renderActiveLevel() {
  const level = getActiveLevel();
  levelTags.innerHTML = "";

  if (!level) {
    levelTitle.textContent = "暂无关卡";
    levelDescription.textContent = "请检查 data/levels.json。";
    levelPassScore.textContent = "";
    scoreButton.disabled = true;
    return;
  }

  levelTitle.textContent = level.title;
  levelDescription.textContent = level.description;
  levelPassScore.textContent = `过关 ${level.passScore} 分`;
  scoreButton.disabled = false;

  for (const tag of level.targetTags) {
    const tagElement = document.createElement("span");
    tagElement.className = "level-tag";
    tagElement.textContent = getTagName(tag);
    levelTags.appendChild(tagElement);
  }
}

/**
 * 根据 currentOutfit 的图片路径找到当前穿着的全部服装数据。
 */
function getWornClothes() {
  const wornClothes = [];

  for (const type of TYPE_ORDER) {
    const selectedSrc = currentOutfit[type];

    if (!selectedSrc) {
      continue;
    }

    const item = clothesData.find((clothes) => {
      return clothes.type === type && clothes.src === selectedSrc;
    });

    if (item) {
      wornClothes.push(item);
    }
  }

  return wornClothes;
}

/**
 * 计算单件服装在当前关卡中的贡献分和命中标签。
 */
function calculateItemScore(item, targetTags) {
  const matchedTags = [];
  let points = 0;

  for (const tag of targetTags) {
    const hasTag = Array.isArray(item.styleTags) && item.styleTags.includes(tag);

    if (hasTag) {
      matchedTags.push(tag);
      points += Number(item.score?.[tag]) || 0;
    }
  }

  return {
    item,
    matchedTags,
    points
  };
}

/**
 * 计算当前整套搭配的总分，并生成每件服装的评分详情。
 */
function calculateOutfitScore(level) {
  const details = getWornClothes().map((item) => {
    return calculateItemScore(item, level.targetTags);
  });

  const totalScore = details.reduce((total, detail) => {
    return total + detail.points;
  }, 0);

  return {
    totalScore,
    details
  };
}

/**
 * 根据总分与关卡过关分的比例返回 S、A、B、C 评级。
 */
function getScoreGrade(totalScore, passScore) {
  if (totalScore >= passScore * 1.3) {
    return "S";
  }

  if (totalScore >= passScore) {
    return "A";
  }

  if (totalScore >= passScore * 0.7) {
    return "B";
  }

  return "C";
}

/**
 * 点击“开始评分”后计算当前搭配并显示结果。
 */
function startScoring() {
  const level = getActiveLevel();

  if (!level) {
    showToast("暂无可评分关卡");
    return;
  }

  const result = calculateOutfitScore(level);
  const grade = getScoreGrade(result.totalScore, level.passScore);
  renderScoreResult(level, result, grade);
  openScoreModal();
}

/**
 * 将总分、评级、过关结果和每件服装贡献渲染到评分弹层。
 */
function renderScoreResult(level, result, grade) {
  const hasPassed = result.totalScore >= level.passScore;

  scoreGrade.textContent = grade;
  scoreTotal.textContent = `${result.totalScore} 分`;
  scorePassText.textContent = hasPassed
    ? `挑战成功，超过 ${level.passScore} 分过关线`
    : `还差 ${level.passScore - result.totalScore} 分过关`;

  renderScoreDetails(result.details, level.targetTags);
}

/**
 * 渲染每一件已穿服装贡献的分数与命中标签。
 */
function renderScoreDetails(details, targetTags) {
  scoreDetails.innerHTML = "";

  if (details.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "level-description";
    emptyMessage.textContent = "当前还没有穿着任何服装，先去搭配一套造型吧。";
    scoreDetails.appendChild(emptyMessage);
    return;
  }

  for (const detail of details) {
    const detailItem = document.createElement("div");
    detailItem.className = "score-detail-item";

    const name = document.createElement("span");
    name.className = "score-detail-name";
    name.textContent = `${TYPE_NAMES[detail.item.type]}：${detail.item.name}`;

    const points = document.createElement("span");
    points.className = "score-detail-points";
    points.textContent = `+${detail.points} 分`;

    const tags = document.createElement("span");
    tags.className = "score-detail-tags";
    tags.textContent =
      detail.matchedTags.length > 0
        ? `命中：${detail.matchedTags.map(getTagName).join("、")}`
        : `未命中本关主题：${targetTags.map(getTagName).join("、")}`;

    detailItem.append(name, points, tags);
    scoreDetails.appendChild(detailItem);
  }
}

/**
 * 打开评分结果弹层。
 */
function openScoreModal() {
  scoreModal.classList.remove("is-hidden");
  closeScoreButton.focus();
}

/**
 * 关闭评分结果弹层。
 */
function closeScoreModal() {
  scoreModal.classList.add("is-hidden");
  scoreButton.focus();
}

/**
 * 点击弹层遮罩时关闭评分结果，点击内容区域时保持打开。
 */
function handleScoreModalClick(event) {
  if (event.target === scoreModal) {
    closeScoreModal();
  }
}

/**
 * 将当前搭配保存到 localStorage。
 */
function saveOutfit() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(currentOutfit));
    showToast("搭配保存成功");
  } catch (error) {
    console.error(error);
    showToast("搭配保存失败");
  }
}

/**
 * 从 localStorage 读取搭配，并恢复所有角色图层。
 */
function loadOutfit() {
  const savedText = localStorage.getItem(SAVE_KEY);

  if (!savedText) {
    showToast("还没有保存过搭配");
    return;
  }

  try {
    const savedOutfit = JSON.parse(savedText);

    if (!isValidOutfit(savedOutfit)) {
      throw new Error("存档格式不正确");
    }

    for (const type of TYPE_ORDER) {
      const savedItem = clothesData.find((item) => {
        return item.type === type && item.src === savedOutfit[type];
      });

      currentOutfit[type] =
        savedItem && isClothesOwned(savedItem.id) ? savedOutfit[type] : null;
    }

    currentOutfit.bg = savedOutfit.bg;
    applyCurrentOutfit();
    renderClothesList();
    renderBackgroundButtons();
    showToast("已读取上次搭配");
  } catch (error) {
    console.error(error);
    showToast("存档格式有误");
  }
}

/**
 * 检查 localStorage 中读取出的搭配是否符合 currentOutfit 格式。
 */
function isValidOutfit(outfit) {
  if (!outfit || typeof outfit !== "object" || typeof outfit.bg !== "string") {
    return false;
  }

  return TYPE_ORDER.every((type) => {
    return outfit[type] === null || typeof outfit[type] === "string";
  });
}

/**
 * 清空全部服装，背景保持当前选择不变。
 */
function clearOutfit() {
  for (const type of TYPE_ORDER) {
    currentOutfit[type] = null;
  }

  applyCurrentOutfit();
  renderClothesList();
  showToast("当前搭配已清空");
}

/**
 * 显示短暂的操作提示。
 */
function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");

  toastTimer = window.setTimeout(hideToast, 1800);
}

/**
 * 隐藏操作提示。
 */
function hideToast() {
  toast.classList.remove("is-visible");
}

/**
 * 从首页进入换装页面。
 */
function showDressPage() {
  homePage.classList.add("is-hidden");
  shopPage.classList.add("is-hidden");
  storyPage.classList.add("is-hidden");
  dressPage.classList.remove("is-hidden");
}

/**
 * 打开服装商店，并记录关闭商店后要返回的页面。
 */
function showShopPage(returnPage = "home") {
  shopReturnPage = returnPage;
  activeShopType = "all";
  homePage.classList.add("is-hidden");
  storyPage.classList.add("is-hidden");
  dressPage.classList.add("is-hidden");
  shopPage.classList.remove("is-hidden");
  renderShopCategoryButtons();
  renderShopList();
  updateInventoryDisplay();
}

/**
 * 关闭商店并返回进入商店前的页面。
 */
function closeShopPage() {
  if (shopReturnPage === "dress") {
    showDressPage();
    return;
  }

  showHomePage();
}

/**
 * 从首页进入剧情模式的章节选择页面。
 */
function showStoryPage() {
  homePage.classList.add("is-hidden");
  shopPage.classList.add("is-hidden");
  dressPage.classList.add("is-hidden");
  storyPage.classList.remove("is-hidden");
  showChapterSelect();
}

/**
 * 从换装页面返回首页。
 */
function showHomePage() {
  shopPage.classList.add("is-hidden");
  storyPage.classList.add("is-hidden");
  dressPage.classList.add("is-hidden");
  homePage.classList.remove("is-hidden");
}

/**
 * 绑定页面中的固定按钮事件。
 */
function bindEvents() {
  startButton.addEventListener("click", showDressPage);
  shopButton.addEventListener("click", () => showShopPage("home"));
  dressShopButton.addEventListener("click", () => showShopPage("dress"));
  shopBackButton.addEventListener("click", closeShopPage);
  storyModeButton.addEventListener("click", showStoryPage);
  backButton.addEventListener("click", showHomePage);
  storyBackButton.addEventListener("click", handleStoryBack);
  nextDialogueButton.addEventListener("click", advanceDialogue);
  clearButton.addEventListener("click", clearOutfit);
  saveButton.addEventListener("click", saveOutfit);
  loadButton.addEventListener("click", loadOutfit);
  levelSelect.addEventListener("change", handleLevelChange);
  scoreButton.addEventListener("click", startScoring);
  closeScoreButton.addEventListener("click", closeScoreModal);
  confirmScoreButton.addEventListener("click", closeScoreModal);
  scoreModal.addEventListener("click", handleScoreModalClick);
}

// 先绑定按钮，再加载游戏数据。
bindEvents();
initGame();
