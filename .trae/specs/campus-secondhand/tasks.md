# 校园二手物交换小程序 - 实现计划

## [ ] Task 1: 配置云开发环境
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 更新 `miniprogram/app.js` 中的 `env` 参数为 `cloud1-d2gqiguwse868c9a5`
  - 更新 `miniprogram/envList.js` 添加云环境配置
  - 确保云开发初始化正确
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `programmatic` TR-1.1: 云开发初始化成功，console无报错
  - `human-judgement` TR-1.2: 确认envList.js包含正确的云环境ID
- **Notes**: 需要在微信开发者工具中确认云环境已开通

## [ ] Task 2: 创建数据库集合和索引
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 在云开发控制台创建 items、favorites、users 三个集合
  - 配置各集合的权限（items: 仅创建者可写，所有人可读；favorites: 仅创建者可读可写；users: 仅本人可读可写）
  - 创建必要的索引（items: name、category、price、userId、status、createTime；favorites: userId、itemId及复合唯一索引）
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-4, AC-7, AC-9]
- **Test Requirements**:
  - `programmatic` TR-2.1: 验证三个集合均已创建
  - `human-judgement` TR-2.2: 确认索引配置正确，权限设置符合要求
- **Notes**: 需要在云开发控制台手动操作

## [ ] Task 3: 创建用户登录云函数 (login)
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 创建云函数 `login`，从上下文获取openid
  - 查询users集合，不存在则创建新用户记录
  - 返回用户openid和基本信息
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `programmatic` TR-3.1: 调用云函数返回正确的openid和用户信息
  - `programmatic` TR-3.2: 首次登录自动创建用户记录
- **Notes**: 使用 `cloud.getWXContext()` 获取用户openid

## [ ] Task 4: 创建物品CRUD云函数
- **Priority**: high
- **Depends On**: Task 2, Task 3
- **Description**: 
  - 创建 `createItem` 云函数：验证必填字段，获取用户openid，创建物品记录
  - 创建 `updateItem` 云函数：验证物品归属，更新物品信息
  - 创建 `deleteItem` 云函数：验证物品归属，删除物品及关联收藏
- **Acceptance Criteria Addressed**: [AC-2, AC-8, AC-9]
- **Test Requirements**:
  - `programmatic` TR-4.1: 创建物品返回物品ID和success=true
  - `programmatic` TR-4.2: 更新物品验证权限，非创建者无法更新
  - `programmatic` TR-4.3: 删除物品验证权限，非创建者无法删除
- **Notes**: 所有操作需要验证用户身份

## [ ] Task 5: 创建物品查询云函数
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 创建 `getItems` 云函数：支持分类筛选、关键词搜索、分页查询
  - 创建 `getItemDetail` 云函数：查询物品详情及收藏状态
- **Acceptance Criteria Addressed**: [AC-3, AC-4, AC-5, AC-6]
- **Test Requirements**:
  - `programmatic` TR-5.1: 获取列表返回正确格式（list+total）
  - `programmatic` TR-5.2: 分类筛选返回对应分类物品
  - `programmatic` TR-5.3: 关键词搜索返回匹配物品
  - `programmatic` TR-5.4: 获取详情返回物品信息和收藏状态
- **Notes**: 使用正则表达式实现关键词模糊搜索

## [ ] Task 6: 创建收藏云函数
- **Priority**: medium
- **Depends On**: Task 2, Task 3
- **Description**: 
  - 创建 `toggleFavorite` 云函数：切换收藏状态
  - 创建 `getMyFavorites` 云函数：获取用户收藏列表
- **Acceptance Criteria Addressed**: [AC-7]
- **Test Requirements**:
  - `programmatic` TR-6.1: 未收藏时调用返回isFavorite=true
  - `programmatic` TR-6.2: 已收藏时调用返回isFavorite=false
  - `programmatic` TR-6.3: 获取收藏列表返回正确数据
- **Notes**: 使用复合唯一索引防止重复收藏

## [ ] Task 7: 创建"我的"相关云函数
- **Priority**: medium
- **Depends On**: Task 2, Task 3
- **Description**: 
  - 创建 `getMyItems` 云函数：获取当前用户发布的物品列表
- **Acceptance Criteria Addressed**: [AC-8, AC-9]
- **Test Requirements**:
  - `programmatic` TR-7.1: 返回当前用户发布的物品列表
- **Notes**: 根据userId查询

## [ ] Task 8: 更新首页 (物品列表和搜索)
- **Priority**: high
- **Depends On**: Task 5
- **Description**: 
  - 更新 `pages/index/index.wxml`：添加搜索栏、分类标签、物品卡片列表
  - 更新 `pages/index/index.js`：调用云函数获取物品列表，实现下拉刷新和上拉加载
  - 更新 `pages/index/index.wxss`：样式美化
- **Acceptance Criteria Addressed**: [AC-3, AC-4, AC-5]
- **Test Requirements**:
  - `human-judgement` TR-8.1: 页面显示搜索栏、分类标签、物品列表
  - `human-judgement` TR-8.2: 下拉刷新正常工作
  - `human-judgement` TR-8.3: 上拉加载更多正常工作
- **Notes**: 分类列表需要在页面中硬编码（如：数码产品、图书教材、生活用品、运动户外、服饰鞋包、其他）

## [ ] Task 9: 创建发布页
- **Priority**: high
- **Depends On**: Task 4
- **Description**: 
  - 创建 `pages/publish/index.wxml`：物品名称输入、描述输入、分类选择、价格输入、图片上传、联系方式输入
  - 创建 `pages/publish/index.js`：图片上传逻辑、表单验证、调用云函数发布
  - 创建 `pages/publish/index.wxss`：样式美化
- **Acceptance Criteria Addressed**: [AC-2]
- **Test Requirements**:
  - `human-judgement` TR-9.1: 表单包含所有必填字段
  - `programmatic` TR-9.2: 表单验证生效，必填字段为空时提示
  - `human-judgement` TR-9.3: 图片上传成功并显示预览
- **Notes**: 图片上传使用微信原生API

## [ ] Task 10: 创建物品详情页
- **Priority**: high
- **Depends On**: Task 5, Task 6
- **Description**: 
  - 创建 `pages/detail/index.wxml`：图片轮播、物品信息、发布者信息、收藏按钮、联系按钮
  - 创建 `pages/detail/index.js`：获取物品详情、切换收藏状态、联系发布者
  - 创建 `pages/detail/index.wxss`：样式美化
- **Acceptance Criteria Addressed**: [AC-6, AC-7, AC-10]
- **Test Requirements**:
  - `human-judgement` TR-10.1: 页面显示完整的物品信息
  - `programmatic` TR-10.2: 收藏按钮点击后状态切换正确
  - `human-judgement` TR-10.3: 联系按钮显示发布者联系方式
- **Notes**: 通过URL参数传递itemId

## [ ] Task 11: 创建我的页
- **Priority**: medium
- **Depends On**: Task 3, Task 7, Task 6
- **Description**: 
  - 创建 `pages/mine/index.wxml`：用户头像昵称、功能入口（我的发布、我的收藏）
  - 创建 `pages/mine/index.js`：获取用户信息、跳转到对应页面
  - 创建 `pages/mine/index.wxss`：样式美化
- **Acceptance Criteria Addressed**: [AC-8, AC-9]
- **Test Requirements**:
  - `human-judgement` TR-11.1: 显示用户头像和昵称
  - `human-judgement` TR-11.2: 点击"我的发布"跳转到正确页面
  - `human-judgement` TR-11.3: 点击"我的收藏"跳转到正确页面
- **Notes**: 用户信息存储在app.globalData中

## [ ] Task 12: 创建我的发布页
- **Priority**: medium
- **Depends On**: Task 7, Task 4
- **Description**: 
  - 创建 `pages/my-items/index.wxml`：物品列表、编辑/删除操作按钮
  - 创建 `pages/my-items/index.js`：获取用户发布列表、编辑物品、删除物品
  - 创建 `pages/my-items/index.wxss`：样式美化
- **Acceptance Criteria Addressed**: [AC-8, AC-9]
- **Test Requirements**:
  - `human-judgement` TR-12.1: 显示用户发布的所有物品
  - `human-judgement` TR-12.2: 编辑按钮跳转到发布页并带参数
  - `programmatic` TR-12.3: 删除物品调用云函数成功
- **Notes**: 删除操作需要二次确认

## [ ] Task 13: 创建我的收藏页
- **Priority**: medium
- **Depends On**: Task 6
- **Description**: 
  - 创建 `pages/my-favorites/index.wxml`：收藏物品列表、取消收藏按钮
  - 创建 `pages/my-favorites/index.js`：获取收藏列表、取消收藏
  - 创建 `pages/my-favorites/index.wxss`：样式美化
- **Acceptance Criteria Addressed**: [AC-7]
- **Test Requirements**:
  - `human-judgement` TR-13.1: 显示用户收藏的所有物品
  - `programmatic` TR-13.2: 取消收藏调用云函数成功
- **Notes**: 点击物品卡片跳转到详情页

## [ ] Task 14: 更新app.json配置
- **Priority**: high
- **Depends On**: Task 8, Task 9, Task 11
- **Description**: 
  - 更新 `miniprogram/app.json`：配置所有页面路由、TabBar（首页、发布、我的）
  - 设置页面标题和导航栏样式
- **Acceptance Criteria Addressed**: [AC-3, AC-2, AC-8, AC-9]
- **Test Requirements**:
  - `human-judgement` TR-14.1: TabBar显示三个导航项
  - `human-judgement` TR-14.2: 页面跳转正常
- **Notes**: TabBar图标使用项目中已有的图片资源

## [ ] Task 15: 全局样式和工具函数
- **Priority**: medium
- **Depends On**: None
- **Description**: 
  - 更新 `miniprogram/app.wxss`：全局样式、颜色变量、通用组件样式
  - 创建工具函数文件 `miniprogram/utils/index.js`：时间格式化、价格格式化等
- **Acceptance Criteria Addressed**: [NFR-4]
- **Test Requirements**:
  - `human-judgement` TR-15.1: 页面样式统一美观
  - `programmatic` TR-15.2: 工具函数格式化正确
- **Notes**: 使用CSS变量管理主题色