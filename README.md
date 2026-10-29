# 🌳 烦恼树洞 · 心愿果

> 一个会结果子的班级树洞：**烦恼写下来变成树上的虫，同学的开导让虫子化作一颗心愿果，果实越多，爱心榜越靠前。**

三峡大学人工智能与计算机学院 计科2班 班级小程序，配合公众号「帧落贰时」的「贰时树洞」栏目使用。

---

## ✨ 玩法机制

```
写下烦恼 ──→ 树上长出一只烦恼虫 🐛（匿名挂在枝头）
                 │
同学开导 ──→ 小虫化作一颗心愿果 🍎
                 │
          果实计入爱心值 ──→ 冲上爱心排行榜 👑
```

- **一人一虫一果**：更新时以「未解决」为条件，天然防止两人抢同一条烦恼
- **匿名发布**：只记录身份用于权限校验，展示层不暴露作者
- **称号体系**：10 果 = 护林员 · 30 果 = 果园守护神 · 100 果 = 树洞之光
- **温柔兜底**：识别到情绪危机类表达时不拦截发布，而是给出关怀提示并引导心理援助渠道

## 📱 功能页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 解忧树 | `pages/index/index` | 插画大树 + 可点击烦恼虫 + 果实计数 |
| 扔虫 | `pages/write/write` | 选心情、选期待、匿名写下心事 |
| 捡虫 | `pages/pick/pick` | 随机捡起一条烦恼，写回复送出温暖 |
| 爱心榜 | `pages/rank/rank` | 按果实数聚合排名 + 称号 |

## 🛠 技术栈

- **前端**：微信小程序原生（WXML / WXSS / JS），无框架、无构建工具
- **后端**：WorkBuddy 云服务（托管 PostgreSQL + PostgREST 风格数据接口）
- **SDK**：`@tencent-ai/workbuddy-cloud-sdk`（`/miniprogram` 子路径）
- **登录**：`wx.login` 静默换取云端会话，用户无感知
- **安全**：数据库行级安全策略（RLS）+ 客户端内容过滤

## 📂 目录结构

```
.
├── app.js                  # 应用入口，启动即静默登录
├── app.json                # 页面 / tabBar / 转发能力配置
├── app.wxss                # 全局样式
├── project.config.json     # 开发者工具项目配置
├── pages/
│   ├── index/              # 解忧树（首页）
│   ├── write/               # 扔虫
│   ├── pick/               # 捡虫
│   └── rank/               # 爱心榜
├── utils/
│   ├── cloud.js            # 云服务客户端初始化 + ensureLogin
│   ├── moderation.js       # 内容安全过滤 / 情绪关怀
│   └── workbuddy-cloud-diagnostics.js  # 请求失败诊断日志
└── assets/                 # tabBar 图标与树景插画
```

## 🚀 本地运行

1. **安装依赖**
   ```bash
   npm install
   ```

2. **导入项目**
   微信开发者工具 → 导入项目 → 选择本目录 → 填入你自己的小程序 AppID

3. **构建 npm**
   开发者工具菜单「工具 → 构建 npm」（会生成 `miniprogram_npm/`，该目录不入库）

4. **配置云服务**
   打开 `utils/cloud.js`，把 `endpoint` 与 `publishableKey` 替换为你自己的云服务配置

5. **建表**
   在你的云数据库执行：
   ```sql
   CREATE TABLE public.worries (
     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
     owner_id TEXT NOT NULL DEFAULT auth.uid(),
     content TEXT NOT NULL,
     mood TEXT NOT NULL DEFAULT '🌧️',
     need TEXT NOT NULL DEFAULT '💬 一个建议',
     resolved BOOLEAN NOT NULL DEFAULT FALSE,
     claimed_by TEXT NOT NULL DEFAULT '',
     reply TEXT NOT NULL DEFAULT '',
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     replied_at TIMESTAMPTZ
   );
   ```
   行级安全策略：全员可读、仅本人可插入、未认领的烦恼可被他人认领更新。

## 🔐 隐私与合规

- 收集的信息仅有一项：**用户发布的文字内容**（发布心事与回应）
- 已在小程序后台配置《用户隐私保护指引》与 UGC 场景声明
- 内容过滤覆盖违禁词拦截与情绪危机识别
- `publishableKey` 为前端公开凭证，权限由服务端按来源校验，不含私密密钥

## 📄 License

[MIT](./LICENSE)

---

用一句话概括这个项目：**把「漂流瓶」的匿名倾诉，做成一棵会长果子的树。**
