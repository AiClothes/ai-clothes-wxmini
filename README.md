# ai-clothes-wxmini 前端项目文档

## 一、项目简介

本项目为"AI服装"微信小程序前端，基于 Taro + React + NutUI 构建，支持多端（微信/字节跳动/H5）运行。主要功能包括商品浏览、AI创作、作品管理、用户中心等。

---

## 二、目录结构

```
ai-clothes-wxmini/
├── src/
│   ├── assets/         # 静态资源（图片、字体等）
│   ├── components/     # 全局可复用组件
│   ├── pages/          # 小程序页面目录（每个子目录为一个页面）
│   ├── store/          # 全局状态管理（Zustand）
│   ├── utils/          # 工具函数（API、上传、登录等）
│   ├── index.html      # H5端入口
│   ├── app.js          # 全局入口
│   ├── app.scss        # 全局样式
│   └── app.config.js   # 全局页面配置
├── resources/          # 业务相关图片资源
├── config/             # 构建/环境配置
├── package.json        # 依赖与脚本
├── babel.config.js     # Babel 配置
├── project.config.json # 微信小程序项目配置
├── project.tt.json     # 字节跳动小程序配置
├── project.private.config.json # 本地私有配置
└── ...
```

---

## 三、依赖与技术栈

- **Taro 3.x**：多端小程序开发框架
- **React 18**：主视图库
- **NutUI React Taro**：UI组件库
- **Zustand**：全局状态管理
- **Sass**：样式预处理
- **uuid**、**immer**：辅助库

详见 `package.json`。

---

## 四、全局配置

- **入口页面**：`pages/index/index`
- **页面路由**：见 `src/app.config.js`
- **小程序AppID**：`wxa7dfe2f73abb0203`
- **H5入口**：`src/index.html`
- **全局样式**：`src/app.scss`、`src/assets/iconfont.css`
- **多平台支持**：微信、字节跳动、H5等

---

## 五、页面与核心逻辑

### 1. 首页（`pages/index/index.jsx`）

- 顶部为四大Tab：橱窗（Shop）、创作（Design）、作品（Work）、我的（My），底部为自定义Tabbar。
- 启动时自动检测本地token，调用 `/api-user/v1/user/wx-profile` 获取用户信息，未登录自动跳转登录页。
- 支持微信分享（好友、朋友圈）。
- 首页弹窗公告，内容由后端配置动态拉取。
- Tab切换时自动切换页面内容和顶部标题。
- 各Tab页面均为独立组件，数据和状态通过全局store管理。

#### 1.1 橱窗Tab（Shop）
- 商品分类Tab，支持切换、懒加载。
- 商品列表支持分页加载、下拉加载更多。
- 支持商品搜索。
- 商品点击跳转商品详情页。
- 主要API：
  - `/api-product/v1/product-category/wx-find-all`（获取商品分类）
  - `/api-product/v1/product/wx-find-all` 或 `/api-product/v1/product/wx-find-list`（获取商品列表）

#### 1.2 创作Tab（Design）
- AI绘图入口，支持输入咒语、选择风格、图片比例、分辨率、反向词等参数。
- 支持金币消耗校验，余额不足时弹窗提示充值或兑换密钥。
- 支持AI生成图片并自动上传、保存为作品。
- 主要API：
  - `/api-user/v1/user-work/create`（创建AI作品）
  - 相关AI服务API（如有）

#### 1.3 作品Tab（Work）
- 展示用户作品（图案/衣服）、支持"全部/收藏"切换。
- 支持导入本地图片为作品。
- 支持作品分页加载、下拉加载更多。
- 作品点击跳转作品详情页或商品作品详情页。
- 主要API：
  - `/api-user/v1/user-work/wx-my-works`（获取作品列表）
  - `/api-user/v1/user-work/create`（导入作品）

#### 1.4 我的Tab（My）
- 展示用户头像、昵称、UID、金币余额。
- 支持跳转充值金币、兑换秘钥、关于我们等页面。
- 未登录时点击头像跳转登录页。
- 主要API：
  - `/api-user/v1/user/wx-profile`（获取用户信息）

---

### 2. 商品详情页（`pages/product/index.jsx`）

- 商品图片、规格、价格、描述、规格切换
- 主要API：`/api-product/v1/product/wx-find-one`

---

### 3. 作品详情页（`pages/work_detail/index.jsx`）

- 作品大图、名称、描述、收藏/取消收藏、编辑、删除、AI抠图
- 主要API：
  - `/api-user/v1/user-work/wx-my-work-detail`
  - `/api-user/v1/user-work/update`
  - `/api-common/v1/common/ai-cut`
  - `/api-user/v1/user-work/create`

---

### 4. 商品作品详情页（`pages/product_work/index.jsx`）

- 商品与作品结合详情
- 主要API：
  - `/api-product/v1/product/wx-find-one`
  - `/api-user/v1/user-work/wx-my-work-detail`

---

### 5. 登录页（`pages/login/index.jsx`）

- 微信一键登录/注册、手机号登录（预留）
- 主要API：
  - `/api-user/v1/auth/online-wx-user`
  - `/api-user/v1/user/wx-profile`

---

### 6. 其他功能页

### 1. 充值金币页（`pages/gold/index.jsx`）
- 展示用户金币余额，支持多种金额充值，自动生成订单号。
- 支持自定义金额充值，自动换算金币数量。
- 选择充值金额后，生成订单号，调用后端微信支付下单接口，调起微信支付。
- 支付成功后，自动创建订单并刷新用户金币余额。
- 主要API：
  - `/api-product/v1/product/wx-find-one`（获取金币商品信息）
  - `/api-order/v1/order/wxpay`（微信支付下单）
  - `/api-order/v1/order/create-wx`（创建充值订单）
  - 用户信息刷新：`/api-user/v1/user/wx-profile`

### 2. 兑换秘钥页（`pages/exchange_key/index.jsx`）
- 输入兑换码，校验格式，提交后调用后端接口进行兑换。
- 主要API：
  - `/api-user/v1/secret-key/use`（兑换秘钥）

### 3. 关于我们页（`pages/about/index.jsx`）
- 展示公司/产品介绍、联系方式等静态信息。

### 4. 抠图页（`pages/photoshop/index.jsx`）
- 通过 WebView 嵌入外部抠图服务页面，支持与小程序通信。
- 主要API：
  - WebView 外部服务（如需与后端交互可补充）

### 5. 排版页面（`pages/set_type/index.jsx`）
- 通过 WebView 嵌入外部排版服务，支持与小程序通信。
- 主要API：
  - WebView 外部服务

---

## 六、全局状态管理（`src/store/`）

- `user.js`：用户登录、信息、状态
- `shop.js`：商品分类、商品列表、搜索
- `work.js`：作品列表、收藏、创建
- `global.js`：全局配置、首页弹窗等

---

## 七、工具函数（`src/utils/`）

- `api.js`：API地址拼接、请求头封装
- `upload.js`：文件上传（含腾讯云COS SDK）
- `toLogin.js`：未登录跳转
- `uuid.js`：生成唯一ID

---

## 八、静态资源

- `src/assets/`：字体、iconfont
- `resources/`：页面用图片（Tab图标、空状态、商品/作品示例图等）

---

## 九、配置与构建

- `babel.config.js`：Babel转译配置，支持NutUI组件自动按需引入
- `config/`：多环境配置（dev、prod）
- `project.config.json`：微信小程序项目配置
- `project.tt.json`：字节跳动小程序配置
- `package.json`：依赖与构建脚本（支持多端编译）

---

## 十、页面路由（`src/app.config.js`）

```js
pages: [
  'pages/index/index',         // 首页
  'pages/login/index',         // 登录
  'pages/product/index',       // 商品详情
  'pages/product_work/index',  // 商品作品详情
  'pages/photoshop/index',     // 抠图
  'pages/set_type/index',      // 排版
  'pages/work_detail/index',   // 作品详情
  'pages/exchange_key/index',  // 兑换秘钥
  'pages/about/index',         // 关于我们
  'pages/gold/index',          // 充值金币
]
```

---

## 十一、API调用与后端接口

所有API请求均通过 `Taro.request`，统一加上 `Authorization` 头（Bearer token），API地址由 `src/utils/api.js` 动态拼接，支持多服务端口。

详细API说明请参考后端 `README.md` 文档。

---

## 十二、重构建议

- 页面结构、路由、状态管理已清晰，重构时可直接对照 Figma 设计稿替换页面内容与样式
- 组件化良好，建议复用现有组件或按需拆分
- API调用已集中封装，便于维护和扩展
- 静态资源、iconfont、全局样式可根据新UI统一替换

---
