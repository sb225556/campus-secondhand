# 校园二手物交换小程序 - 产品需求文档

## Overview
- **Summary**: 一款面向在校大学生的二手物品交换平台小程序，提供物品发布、浏览、搜索、收藏、沟通等功能，帮助学生高效处理闲置物品，促进校园内的资源循环利用。
- **Purpose**: 解决校园内二手物品交易信息不对称、交易效率低的问题，为学生提供安全、便捷的二手物品交换服务。
- **Target Users**: 在校大学生（本科生、研究生）

## Goals
- 实现二手物品的发布与浏览功能
- 提供分类搜索和筛选能力
- 支持用户收藏和沟通功能
- 使用云数据库实现数据持久化，跨设备数据不丢失
- 至少包含列表页和详情页两个核心功能页面
- 实现完整的增删改查操作

## Non-Goals (Out of Scope)
- 在线支付功能（仅支持线下交易）
- 用户实名认证（依赖微信登录）
- 物品物流配送（仅支持校内自提）
- 信用评价体系
- 后台管理系统

## Background & Context
- **小程序基础信息**:
  - APPID: wx17c2929571f3b5e7
  - 云环境ID: cloud1-d2gqiguwse868c9a5
  - 项目根目录: `c:\Users\Administrator\Desktop\222`
- **技术栈**:
  - 微信小程序原生开发
  - 微信云开发（云数据库、云函数、云存储）
- **参考文档**: https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloud/basis/getting-started.html

## Functional Requirements
- **FR-1**: 用户可以通过微信登录，获取用户基本信息（昵称、头像）
- **FR-2**: 用户可以发布二手物品，包含物品名称、描述、分类、价格、图片等信息
- **FR-3**: 用户可以浏览二手物品列表，支持下拉刷新和上拉加载更多
- **FR-4**: 用户可以按分类筛选和关键词搜索物品
- **FR-5**: 用户可以查看物品详情，包含物品信息和发布者信息
- **FR-6**: 用户可以收藏/取消收藏物品
- **FR-7**: 用户可以联系发布者（通过微信聊天）
- **FR-8**: 用户可以编辑和删除自己发布的物品
- **FR-9**: 用户可以查看自己的发布列表和收藏列表

## Non-Functional Requirements
- **NFR-1**: 页面加载时间 ≤ 2秒（在良好网络环境下）
- **NFR-2**: 图片上传大小限制 ≤ 2MB，支持多图上传（最多6张）
- **NFR-3**: 用户数据安全，仅本人可修改/删除自己的发布
- **NFR-4**: 响应式设计，适配不同屏幕尺寸的手机

## Constraints
- **Technical**: 
  - 使用微信小程序原生框架，不引入第三方UI框架
  - 依赖微信云开发能力，必须在云环境 `cloud1-d2gqiguwse868c9a5` 下运行
  - 遵循微信小程序开发规范和审核标准
- **Business**: 
  - 仅面向校园用户，不支持校外交易
  - 不涉及资金交易，仅提供信息撮合
- **Dependencies**: 
  - 微信小程序基础库 2.20.1+
  - 微信云开发 SDK

## Assumptions
- 用户已安装微信并允许小程序获取用户信息
- 用户使用校园网络或良好的移动网络环境
- 用户知晓线下交易的安全风险
- 云环境已开通并配置正确

---

## 数据库设计

### 1. 物品集合 `items`
**用途**: 存储二手物品信息

| 字段名 | 类型 | 说明 | 必填 | 索引 | 权限 |
|--------|------|------|------|------|------|
| _id | string | 物品唯一标识（自动生成） | 是 | 主键 | - |
| name | string | 物品名称 | 是 | 普通索引 | - |
| description | string | 物品描述 | 是 | - | - |
| category | string | 物品分类 | 是 | 普通索引 | - |
| price | number | 价格（元） | 是 | 普通索引 | - |
| images | array | 图片URL数组 | 是 | - | - |
| userId | string | 发布者openid | 是 | 普通索引 | - |
| userName | string | 发布者昵称 | 是 | - | - |
| userAvatar | string | 发布者头像 | 是 | - | - |
| contact | string | 联系方式 | 是 | - | - |
| status | string | 状态（available/sold） | 是 | 普通索引 | - |
| createTime | number | 创建时间戳 | 是 | 普通索引 | - |
| updateTime | number | 更新时间戳 | 否 | - | - |

**集合权限**: 仅创建者可写，所有人可读

### 2. 用户收藏集合 `favorites`
**用途**: 存储用户收藏的物品

| 字段名 | 类型 | 说明 | 必填 | 索引 | 权限 |
|--------|------|------|------|------|------|
| _id | string | 收藏唯一标识（自动生成） | 是 | 主键 | - |
| userId | string | 用户openid | 是 | 普通索引 | - |
| itemId | string | 物品ID | 是 | 普通索引 | - |
| createTime | number | 收藏时间戳 | 是 | - | - |

**索引配置**: 复合索引 `{userId: 1, itemId: 1}`，唯一约束，防止重复收藏

**集合权限**: 仅创建者可读可写

### 3. 用户信息集合 `users`
**用途**: 存储用户基本信息

| 字段名 | 类型 | 说明 | 必填 | 索引 | 权限 |
|--------|------|------|------|------|------|
| _id | string | 用户openid | 是 | 主键 | - |
| nickName | string | 用户昵称 | 是 | - | - |
| avatarUrl | string | 用户头像 | 是 | - | - |
| createTime | number | 首次登录时间戳 | 是 | - | - |
| lastLoginTime | number | 最后登录时间戳 | 否 | - | - |

**集合权限**: 仅本人可读可写

---

## 云函数设计

### 1. `login` - 用户登录
**用途**: 用户登录时获取openid并初始化用户信息

**输入参数**: 无（通过云函数上下文获取）

**输出**: 
```json
{
  "openid": "用户openid",
  "userInfo": { /* 用户信息 */ }
}
```

**逻辑**:
- 从云函数上下文获取用户openid
- 查询users集合是否存在该用户
- 不存在则创建新用户记录
- 返回用户信息

### 2. `uploadImage` - 图片上传
**用途**: 上传物品图片到云存储

**输入参数**: 
- `filePath`: 临时文件路径

**输出**: 
```json
{
  "fileID": "云存储文件ID",
  "url": "图片访问地址"
}
```

**逻辑**:
- 使用云存储上传文件
- 返回文件ID和访问地址

### 3. `createItem` - 发布物品
**用途**: 创建二手物品记录

**输入参数**:
- `name`: 物品名称
- `description`: 物品描述
- `category`: 物品分类
- `price`: 价格
- `images`: 图片URL数组
- `contact`: 联系方式

**输出**: 
```json
{
  "_id": "物品ID",
  "success": true
}
```

**逻辑**:
- 验证必填字段
- 获取当前用户openid
- 创建物品记录到items集合
- 返回物品ID

### 4. `updateItem` - 更新物品
**用途**: 更新物品信息

**输入参数**:
- `itemId`: 物品ID
- `name`: 物品名称（可选）
- `description`: 物品描述（可选）
- `category`: 物品分类（可选）
- `price`: 价格（可选）
- `images`: 图片URL数组（可选）
- `contact`: 联系方式（可选）
- `status`: 状态（可选）

**输出**: 
```json
{
  "success": true
}
```

**逻辑**:
- 验证物品存在且属于当前用户
- 更新物品记录
- 返回成功

### 5. `deleteItem` - 删除物品
**用途**: 删除物品记录

**输入参数**:
- `itemId`: 物品ID

**输出**: 
```json
{
  "success": true
}
```

**逻辑**:
- 验证物品存在且属于当前用户
- 删除物品记录
- 删除关联的收藏记录
- 返回成功

### 6. `getItems` - 获取物品列表
**用途**: 获取物品列表，支持筛选和分页

**输入参数**:
- `category`: 分类筛选（可选）
- `keyword`: 关键词搜索（可选）
- `pageSize`: 每页数量（默认10）
- `pageNum`: 页码（默认1）

**输出**: 
```json
{
  "list": [/* 物品列表 */],
  "total": 总数量
}
```

**逻辑**:
- 构建查询条件（分类、关键词）
- 按创建时间倒序排序
- 分页查询
- 返回列表和总数

### 7. `getItemDetail` - 获取物品详情
**用途**: 获取单个物品的详细信息

**输入参数**:
- `itemId`: 物品ID

**输出**: 
```json
{
  "item": {/* 物品详情 */},
  "isFavorite": false
}
```

**逻辑**:
- 查询物品记录
- 查询当前用户是否收藏该物品
- 返回物品详情和收藏状态

### 8. `toggleFavorite` - 收藏/取消收藏
**用途**: 切换物品收藏状态

**输入参数**:
- `itemId`: 物品ID

**输出**: 
```json
{
  "success": true,
  "isFavorite": true
}
```

**逻辑**:
- 查询是否已收藏
- 已收藏则删除，未收藏则添加
- 返回当前收藏状态

### 9. `getMyItems` - 获取我的发布
**用途**: 获取当前用户发布的物品列表

**输入参数**:
- `pageSize`: 每页数量（默认10）
- `pageNum`: 页码（默认1）

**输出**: 
```json
{
  "list": [/* 物品列表 */],
  "total": 总数量
}
```

**逻辑**:
- 按userId查询物品
- 按创建时间倒序排序
- 分页查询

### 10. `getMyFavorites` - 获取我的收藏
**用途**: 获取当前用户收藏的物品列表

**输入参数**:
- `pageSize`: 每页数量（默认10）
- `pageNum`: 页码（默认1）

**输出**: 
```json
{
  "list": [/* 物品列表 */],
  "total": 总数量
}
```

**逻辑**:
- 查询用户收藏的物品ID
- 根据物品ID查询物品详情
- 返回收藏物品列表

---

## 页面结构设计

### TabBar 页面（底部导航）

#### 1. 首页 `pages/index/index`
**功能**: 物品列表展示、搜索、分类筛选
**组件**:
- 搜索栏
- 分类标签
- 物品卡片列表（下拉刷新、上拉加载）

#### 2. 发布页 `pages/publish/index`
**功能**: 发布二手物品
**组件**:
- 物品名称输入
- 物品描述输入
- 分类选择
- 价格输入
- 图片上传
- 联系方式输入
- 提交按钮

#### 3. 我的页 `pages/mine/index`
**功能**: 用户信息、我的发布、我的收藏、设置
**组件**:
- 用户头像和昵称
- 功能入口（我的发布、我的收藏）
- 退出登录

### 非 TabBar 页面

#### 4. 物品详情页 `pages/detail/index`
**功能**: 物品详情展示、收藏、联系发布者
**组件**:
- 图片轮播
- 物品名称和价格
- 物品描述
- 分类标签
- 发布者信息
- 收藏按钮
- 联系按钮

#### 5. 我的发布页 `pages/my-items/index`
**功能**: 查看和管理自己发布的物品
**组件**:
- 物品列表
- 编辑/删除操作

#### 6. 我的收藏页 `pages/my-favorites/index`
**功能**: 查看和取消收藏
**组件**:
- 收藏物品列表
- 取消收藏操作

---

## Acceptance Criteria

### AC-1: 用户登录
- **Given**: 用户首次打开小程序
- **When**: 小程序自动调用登录云函数
- **Then**: 获取用户openid，若不存在则创建用户记录，返回用户信息
- **Verification**: `programmatic`
- **Notes**: 通过云函数返回值验证

### AC-2: 发布物品
- **Given**: 用户已登录
- **When**: 用户填写物品信息并上传图片，点击发布
- **Then**: 物品成功保存到数据库，返回物品ID，跳转到物品列表页
- **Verification**: `programmatic`
- **Notes**: 验证数据库中是否存在新记录

### AC-3: 浏览物品列表
- **Given**: 数据库中有物品数据
- **When**: 用户进入首页
- **Then**: 显示物品列表，支持下拉刷新和上拉加载更多
- **Verification**: `human-judgment`

### AC-4: 分类筛选
- **Given**: 数据库中有不同分类的物品
- **When**: 用户点击分类标签
- **Then**: 列表只显示对应分类的物品
- **Verification**: `programmatic`

### AC-5: 关键词搜索
- **Given**: 数据库中有包含关键词的物品
- **When**: 用户输入关键词并搜索
- **Then**: 列表显示匹配的物品
- **Verification**: `programmatic`

### AC-6: 查看物品详情
- **Given**: 用户点击物品卡片
- **When**: 进入物品详情页
- **Then**: 显示物品图片、名称、价格、描述、发布者信息
- **Verification**: `human-judgment`

### AC-7: 收藏功能
- **Given**: 用户进入物品详情页
- **When**: 用户点击收藏按钮
- **Then**: 物品添加到收藏列表，按钮变为已收藏状态
- **Verification**: `programmatic`

### AC-8: 编辑物品
- **Given**: 用户进入我的发布列表
- **When**: 用户点击编辑按钮并修改信息
- **Then**: 物品信息更新成功
- **Verification**: `programmatic`

### AC-9: 删除物品
- **Given**: 用户进入我的发布列表
- **When**: 用户点击删除按钮并确认
- **Then**: 物品从数据库删除，列表不再显示
- **Verification**: `programmatic`

### AC-10: 联系发布者
- **Given**: 用户进入物品详情页
- **When**: 用户点击联系按钮
- **Then**: 显示发布者联系方式（微信）
- **Verification**: `human-judgment`

## Open Questions
- [ ] 是否需要添加物品状态筛选（在售/已售出）？
- [ ] 是否需要按价格区间筛选？
- [ ] 是否需要添加用户搜索功能？
- [ ] 是否需要添加物品分享功能？

---

## 开发步骤引导

### 第一步：配置云开发环境
1. 在微信开发者工具中打开云开发控制台
2. 确认云环境ID为 `cloud1-d2gqiguwse868c9a5`
3. 更新 `miniprogram/app.js` 中的 `env` 参数为 `cloud1-d2gqiguwse868c9a5`
4. 更新 `miniprogram/envList.js` 添加云环境配置

### 第二步：创建数据库集合
在云开发控制台的数据库面板中创建以下集合：

1. **items** 集合
   - 权限设置：仅创建者可写，所有人可读
   - 创建索引：name（普通索引）、category（普通索引）、price（普通索引）、userId（普通索引）、status（普通索引）、createTime（普通索引）

2. **favorites** 集合
   - 权限设置：仅创建者可读可写
   - 创建索引：userId（普通索引）、itemId（普通索引）
   - 创建复合索引：{userId: 1, itemId: 1}，勾选唯一约束

3. **users** 集合
   - 权限设置：仅本人可读可写

### 第三步：创建云函数
在云开发控制台的云函数面板中创建以下云函数：
1. `login`
2. `uploadImage`
3. `createItem`
4. `updateItem`
5. `deleteItem`
6. `getItems`
7. `getItemDetail`
8. `toggleFavorite`
9. `getMyItems`
10. `getMyFavorites`

### 第四步：开发小程序页面
按以下顺序开发页面：
1. 更新首页 `pages/index/index` - 物品列表和搜索
2. 创建发布页 `pages/publish/index` - 物品发布
3. 创建详情页 `pages/detail/index` - 物品详情
4. 创建我的页 `pages/mine/index` - 用户中心
5. 创建我的发布页 `pages/my-items/index`
6. 创建我的收藏页 `pages/my-favorites/index`
7. 更新 `app.json` 配置页面路由和TabBar

### 第五步：测试与调试
1. 在微信开发者工具中测试所有功能
2. 验证数据增删改查操作
3. 测试云函数调用
4. 检查页面跳转和交互
5. 验证权限控制（只能修改自己的物品）