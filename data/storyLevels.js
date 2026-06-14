/*
 * 第一章剧情关卡数据。
 * 使用普通 JavaScript 文件，直接双击 index.html 打开时也能读取，
 * 不依赖 fetch 或本地服务器。
 */
window.STORY_CHAPTERS = [
  {
    chapterId: "chapter1",
    chapterName: "第一章：初入搭配职场",
    description: "从第一次面试开始，在不同场合中学习合适的搭配。",
    levels: [
      {
        levelId: "chapter1_level1",
        levelName: "第一关：面试",
        targetAttrs: ["elegant", "daily"],
        targetScore: 45,
        introStory: [
          {
            speaker: "旁白",
            text: "收到面试通知的那一刻，你意识到属于自己的新生活即将开始。"
          },
          {
            speaker: "主角",
            text: "第一次面试，不能太随意，也不能太夸张。我要穿得得体一点。"
          },
          {
            speaker: "旁白",
            text: "请搭配一套适合面试的造型，关键词是“优雅”和“日常”。"
          }
        ],
        successStory: [
          {
            speaker: "面试官",
            text: "你的整体形象很清爽，也很符合岗位气质。"
          },
          {
            speaker: "主角",
            text: "谢谢，我希望自己能从第一天开始就认真对待这份工作。"
          },
          {
            speaker: "旁白",
            text: "面试顺利结束，你获得了入职机会。"
          }
        ],
        failStory: [
          {
            speaker: "面试官",
            text: "你的搭配很有特点，但可能不太适合今天的面试场合。"
          },
          {
            speaker: "主角",
            text: "看来我还需要更注意场合感。"
          },
          {
            speaker: "旁白",
            text: "这次没有成功。也许更优雅、日常的搭配会更适合面试。"
          }
        ]
      },
      {
        levelId: "chapter1_level2",
        levelName: "第二关：第一天上班",
        targetAttrs: ["daily", "elegant"],
        targetScore: 45,
        introStory: [
          {
            speaker: "旁白",
            text: "入职第一天，你站在公司楼下，心里有些紧张。"
          },
          {
            speaker: "主角",
            text: "今天要见到新同事，穿得自然又得体应该最合适。"
          },
          {
            speaker: "旁白",
            text: "请搭配一套适合第一天上班的造型，关键词是“日常”和“优雅”。"
          }
        ],
        successStory: [
          {
            speaker: "同事",
            text: "你的搭配看起来很舒服，也很适合办公室。"
          },
          {
            speaker: "主角",
            text: "太好了，我还担心会不会太正式。"
          },
          {
            speaker: "旁白",
            text: "你顺利融入了新的工作环境。"
          }
        ],
        failStory: [
          {
            speaker: "同事",
            text: "你的搭配很抢眼，不过办公室场合可能需要再低调一点。"
          },
          {
            speaker: "主角",
            text: "原来第一天上班也有这么多细节。"
          },
          {
            speaker: "旁白",
            text: "这次搭配不够贴合场景。试试更日常、优雅的风格吧。"
          }
        ]
      },
      {
        levelId: "chapter1_level3",
        levelName: "第三关：和朋友出门玩",
        targetAttrs: ["fresh", "cute"],
        targetScore: 40,
        introStory: [
          {
            speaker: "朋友",
            text: "终于下班啦！周末一起出去走走吧。"
          },
          {
            speaker: "主角",
            text: "好啊，那今天就穿得轻松一点。"
          },
          {
            speaker: "旁白",
            text: "请搭配一套适合和朋友出门玩的造型，关键词是“清凉”和“可爱”。"
          }
        ],
        successStory: [
          {
            speaker: "朋友",
            text: "这套好适合今天，清爽又可爱，拍照一定很好看。"
          },
          {
            speaker: "主角",
            text: "那我们多拍几张！"
          },
          {
            speaker: "旁白",
            text: "你和朋友度过了轻松愉快的一天。"
          }
        ],
        failStory: [
          {
            speaker: "朋友",
            text: "这套也不错，不过感觉和今天轻松出门的氛围不太搭。"
          },
          {
            speaker: "主角",
            text: "也许我穿得太正式了。"
          },
          {
            speaker: "旁白",
            text: "这次搭配没有达到出游氛围。试试更清凉、可爱的组合吧。"
          }
        ]
      },
      {
        levelId: "chapter1_level4",
        levelName: "第四关：参加搭配比赛",
        targetAttrs: ["gorgeous", "sweet"],
        targetScore: 50,
        introStory: [
          {
            speaker: "旁白",
            text: "公司举办了一场小型搭配比赛，每个人都可以展示自己的审美。"
          },
          {
            speaker: "主角",
            text: "这次不只是日常穿搭了，我要让大家眼前一亮。"
          },
          {
            speaker: "旁白",
            text: "请搭配一套适合比赛舞台的造型，关键词是“华丽”和“甜美”。"
          }
        ],
        successStory: [
          {
            speaker: "主持人",
            text: "这套搭配很完整，既有亮点，也保持了甜美的个人风格。"
          },
          {
            speaker: "观众",
            text: "好好看！"
          },
          {
            speaker: "主角",
            text: "原来我也可以完成这么有表现力的搭配。"
          },
          {
            speaker: "旁白",
            text: "你赢得了大家的认可，第一章顺利结束。"
          }
        ],
        failStory: [
          {
            speaker: "主持人",
            text: "这套搭配比较日常，但比赛舞台需要更强的视觉重点。"
          },
          {
            speaker: "主角",
            text: "看来比赛和平时穿搭确实不一样。"
          },
          {
            speaker: "旁白",
            text: "这次没有通过。试试更华丽、甜美的搭配，也许会更适合舞台。"
          }
        ]
      }
    ]
  }
];
