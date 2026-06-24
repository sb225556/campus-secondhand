# 校园二手物交换小程序 - 第二次课升级任务清单

## Task 1: 创建 getStats 云函数
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 在 `cloudfunctions/getStats/` 目录下创建云函数
  - 实现多维度数据统计：总数、收藏、均价、总价值、本月数据、分类统计、7天趋势、状态分布
  - 通过 `cloud.getWXContext()` 获取用户 openid 进行数据过滤
- **Acceptance Criteria Addressed**: 课前验收-数据上云, 加分项-数据统计展示
- **Test Requirements**:
  - `programmatic` TR-1.1: 云函数能正常被调用，返回 `success: true`
  - `programmatic` TR-1.2: 返回数据包含所有统计字段（totalItems, totalFavorites, avgPrice, totalValue, monthItems, categoryStats, weekTrend, statusStats）
  - `human-judgment` TR-1.3: 数据计算逻辑正确（聚合、过滤、求和、平均）
- **Notes**:
  - 使用 `db.collection('items').where({ userId: openid }).get()` 查询
  - 使用 `db.collection('favorites').where({ userId: openid }).get()` 查询
  - 注意日期处理：使用 `new Date(item.createTime)` 解析时间戳

## Task 2: 在云开发控制台创建 stats 集合（可选）
- **Priority**: low
- **Depends On**: None
- **Description**:
  - 在云开发控制台数据库中创建 `stats` 集合
  - 设置权限为"仅创建者可读可写"
  - 创建索引：userId、createTime、action、userId+createTime 复合索引
- **Acceptance Criteria Addressed**: 增强-操作日志
- **Test Requirements**:
  - `programmatic` TR-2.1: 集合创建成功，权限设置生效
  - `programmatic` TR-2.2: 所有索引创建成功
- **Notes**:
  - 本任务为可选，如果不想记录操作日志，可跳过
  - `getStats` 云函数可以仅依赖 items 和 favorites 集合进行统计

## Task 3: 创建统计页面 pages/stats/index
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 创建 `miniprogram/pages/stats/index` 页面（wxml/wxss/js/json）
  - 实现 4 大模块：概览卡片、本月数据、分类统计、7天趋势、状态分布
  - 使用纯 CSS 实现柱状图和进度条
  - 调用 `getStats` 云函数获取数据
- **Acceptance Criteria Addressed**: 加分项-数据统计展示
- **Test Requirements**:
  - `programmatic` TR-3.1: 页面能正常加载并显示统计数据
  - `programmatic` TR-3.2: 调用 `getStats` 云函数成功，返回数据正确渲染
  - `human-judgment` TR-3.3: 页面布局美观，符合 UI 规范（卡片化、配色合理、字体大小合适）
  - `human-judgment` TR-3.4: 图表展示清晰，柱状图、进度条比例正确
- **Notes**:
  - 数据为空时显示空状态提示
  - 添加下拉刷新功能
  - 页面标题：数据统计

## Task 4: 在 app.json 中注册统计页
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  - 在 `miniprogram/app.json` 的 `pages` 数组中添加 `pages/stats/index`
- **Acceptance Criteria Addressed**: 课前验收-至少 2 个页面
- **Test Requirements**:
  - `programmatic` TR-4.1: app.json 文件 JSON 格式正确
  - `programmatic` TR-4.2: 页面路径正确注册
- **Notes**:
  - 将 `pages/stats/index` 添加到 pages 数组的第一位（首页）

## Task 5: 在 mine 页面添加统计入口
- **Priority**: medium
- **Depends On**: Task 3
- **Description**:
  - 修改 `miniprogram/pages/mine/index.wxml`，添加"数据统计"菜单项
  - 修改 `miniprogram/pages/mine/index.js`，添加 `onStats` 方法跳转到统计页
- **Acceptance Criteria Addressed**: 加分项-数据统计展示
- **Test Requirements**:
  - `programmatic` TR-5.1: "我的"页面正确显示"数据统计"菜单项
  - `programmatic` TR-5.2: 点击菜单项能正确跳转到统计页
- **Notes**:
  - 使用 `wx.navigateTo` 跳转到统计页
  - 菜单图标使用 `images/icons/setting.svg` 或其他合适的图标

## Task 6: 增强首页按日期排序和筛选
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - 修改 `miniprogram/pages/index/index.js`，添加按日期排序逻辑
  - 修改 `miniprogram/pages/index/index.wxml`，添加时间筛选 UI（今日/本周/本月/全部）
- **Acceptance Criteria Addressed**: 加分项-按条件筛选
- **Test Requirements**:
  - `programmatic` TR-6.1: 按日期排序功能正常（最新/最早切换）
  - `programmatic` TR-6.2: 时间筛选功能正常（今日/本周/本月/全部）
  - `human-judgment` TR-6.3: 筛选 UI 简洁易用
- **Notes**:
  - 排序在云函数中实现，传 `sortBy` 和 `sortOrder` 参数
  - 或者在前端对查询结果进行排序

## Task 7: 测试和验证
- **Priority**: high
- **Depends On**: Task 1, 3, 4, 5
- **Description**:
  - 部署 `getStats` 云函数
  - 编译预览小程序
  - 测试添加物品、收藏物品后统计页数据正确
  - 测试换设备登录后数据同步
- **Acceptance Criteria Addressed**: 全部
- **Test Requirements**:
  - `programmatic` TR-7.1: getStats 云函数部署成功，状态为"已部署"
  - `programmatic` TR-7.2: 统计数据计算正确（手动验证几个数据）
  - `programmatic` TR-7.3: 换设备登录后数据一致
  - `human-judgment` TR-7.4: 整体用户体验流畅
- **Notes**:
  - 在云开发控制台验证云函数状态
  - 使用真机扫码测试

## ✅ Task 8: 提交代码到 GitHub [x]
- **Priority**: medium
- **Depends On**: Task 7
- **Description**:
  - 使用 `git add .` 添加所有新文件
  - 使用 `git commit -m "feat: 新增数据统计功能，体现云开发作用"` 提交
  - 使用 `git push origin main` 推送到 GitHub
- **Acceptance Criteria Addressed**: None
- **Test Requirements**:
  - `programmatic` TR-8.1: GitHub 仓库能看到新提交的代码
- **Notes**:
  - 提交信息要清晰描述本次升级内容

---

# Task Dependencies

```
Task 1 (getStats 云函数)
  └──> Task 3 (统计页面)
        └──> Task 4 (app.json 注册)
        └──> Task 5 (mine 页面入口)

Task 6 (首页增强) - 独立任务
Task 2 (stats 集合) - 独立可选任务
Task 7 (测试) - 依赖 Task 1, 3, 4, 5
Task 8 (提交代码) - 依赖 Task 7
```

## 并行可执行任务

- **Task 1** 和 **Task 2** 可并行
- **Task 6** 可与 Task 1-5 并行

## 串行任务

- **Task 3** 必须等待 **Task 1** 完成
- **Task 4** 和 **Task 5** 必须等待 **Task 3** 完成
- **Task 7** 必须等待所有开发任务完成
- **Task 8** 必须等待 **Task 7** 完成
