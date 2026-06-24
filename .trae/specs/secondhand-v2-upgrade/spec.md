# 校园二手物交换小程序 - 第二次课升级方案

## 1. 升级目标

### 1.1 核心目标
通过升级，全面体现**云开发数据库和云函数的作用**，让用户的数据完全存储在云端，换设备登录数据仍在，符合"方向二：实用工具"第二次课的全部要求。

### 1.2 课前验收要求对照

| 课前验收要求 | 当前状态 | 升级方案 |
|------------|---------|---------|
| 添加功能：有表单页面 | ✅ 已有 `pages/publish/index` | 保留并增强 |
| 列表展示：有列表页面 | ✅ 已有 `pages/index/index` | 保留并增强 |
| 数据上云：换设备登录数据仍在 | ✅ 已有云函数 | 保留并新增统计 |
| 至少 2 个页面 | ✅ 已有 6 个页面 | 新增 1 个统计页 |
| **加分项 1**：删除/编辑已有记录 | ✅ 已有 `pages/my-items/index` | 保留 |
| **加分项 2**：按条件筛选或搜索 | ✅ 已有搜索、分类筛选 | 增强按日期筛选 |
| **加分项 3**：数据统计展示 | ❌ **缺失** | **新增 `pages/stats/index`** |

### 1.3 升级核心
**新增数据统计功能**，是本次升级的重点。通过统计页直观展示云端数据，体现"联机"和"云开发"的核心价值。

---

## 2. 技术架构

### 2.1 现有架构
```
小程序前端（miniprogram）
    ↓ wx.cloud.callFunction
云函数（cloudfunctions）
    ↓ wx-server-sdk
云数据库（items / favorites / users）
```

### 2.2 升级后架构
```
小程序前端
  ├── pages/index/index       首页（增强：按日期排序）
  ├── pages/publish/index     发布页（增强：实时预览）
  ├── pages/detail/index      详情页
  ├── pages/mine/index        我的页（增强：添加统计入口）
  ├── pages/my-items/index    我的发布
  ├── pages/my-favorites/index 我的收藏
  └── pages/stats/index       【新增】数据统计页
        ↓
云函数
  ├── login / createItem / updateItem / deleteItem
  ├── getItems / getItemDetail
  ├── toggleFavorite / getMyFavorites / getMyItems
  └── getStats                【新增】统计云函数
        ↓
云数据库
  ├── items（已有）
  ├── favorites（已有）
  ├── users（已有）
  └── stats                   【新增】操作日志集合（可选）
```

---

## 3. 数据库设计

### 3.1 现有集合（保持不变）

#### items 集合
- **权限**：仅创建者可写，所有人可读
- **字段**：
  - `_id`: 文档ID
  - `name`: 物品名称
  - `description`: 描述
  - `category`: 分类
  - `price`: 价格
  - `images`: 图片列表
  - `contact`: 联系方式
  - `userId`: 发布者openid
  - `userName`: 发布者昵称
  - `userAvatar`: 发布者头像
  - `status`: 状态（在售/已售）
  - `createTime`: 创建时间
  - `updateTime`: 更新时间
- **索引**：
  - `name`（普通）
  - `category`（普通）
  - `price`（普通）
  - `userId`（普通）
  - `status`（普通）
  - `createTime`（普通）

#### favorites 集合
- **权限**：仅创建者可读可写
- **字段**：`_id`, `userId`, `itemId`, `createTime`
- **索引**：
  - `userId`（普通）
  - `itemId`（普通）
  - `userId + itemId`（唯一复合索引）

#### users 集合
- **权限**：仅本人可读可写
- **字段**：`_id`, `openid`, `nickName`, `avatarUrl`, `createTime`, `updateTime`

### 3.2 新增集合：stats（操作日志，可选）

> 说明：本集合为可选，用于记录用户操作日志，辅助统计功能。如果不想增加新集合，`getStats` 云函数也可以直接基于 items 和 favorites 集合进行聚合统计。

- **集合名称**：`stats`
- **权限**：仅创建者可读可写
- **字段**：
  - `_id`: 文档ID
  - `userId`: 用户openid
  - `action`: 操作类型（`publish` / `edit` / `delete` / `favorite`）
  - `itemId`: 关联物品ID
  - `createTime`: 操作时间
- **索引**：
  - `userId`（普通）
  - `createTime`（普通）
  - `action`（普通）
  - `userId + createTime`（普通复合索引，用于按时间范围查询）

### 3.3 数据库创建步骤（您需要操作）

1. 打开微信开发者工具 → 云开发控制台 → 数据库
2. 创建新集合 `stats`（如果采用操作日志方案）
3. 权限设置为：**仅创建者可读可写**
4. 创建索引：
   - `userId`（普通索引）
   - `createTime`（普通索引）
   - `action`（普通索引）
   - `userId` + `createTime`（复合索引）

---

## 4. 云函数设计

### 4.1 现有云函数（保持不变）
- `login`：用户登录
- `createItem`：创建物品
- `updateItem`：更新物品
- `deleteItem`：删除物品
- `getItems`：获取物品列表
- `getItemDetail`：获取物品详情
- `toggleFavorite`：切换收藏
- `getMyItems`：获取我的发布
- `getMyFavorites`：获取我的收藏

### 4.2 新增云函数：getStats

**功能**：统计当前用户的多维度数据

**入参**：
```javascript
{
  // 无需入参，通过 cloud.getWXContext() 获取 openid
}
```

**返回数据**：
```javascript
{
  success: true,
  data: {
    // 总览数据
    totalItems: 12,           // 发布物品总数
    totalFavorites: 8,        // 收藏物品总数
    avgPrice: 45.5,           // 平均价格
    totalValue: 546,          // 物品总价值
    
    // 本月数据
    monthItems: 3,            // 本月发布数
    monthFavorites: 2,        // 本月收藏数
    monthValue: 120,          // 本月价值
    
    // 按分类统计
    categoryStats: [
      { category: '数码产品', count: 5, avgPrice: 200 },
      { category: '图书教材', count: 3, avgPrice: 25 },
      { category: '生活用品', count: 2, avgPrice: 30 },
      { category: '其他', count: 2, avgPrice: 50 }
    ],
    
    // 最近7天发布趋势
    weekTrend: [
      { date: '2026-06-18', count: 1 },
      { date: '2026-06-19', count: 0 },
      { date: '2026-06-20', count: 2 },
      { date: '2026-06-21', count: 0 },
      { date: '2026-06-22', count: 1 },
      { date: '2026-06-23', count: 0 },
      { date: '2026-06-24', count: 1 }
    ],
    
    // 状态分布
    statusStats: {
      onSale: 10,             // 在售
      sold: 2                 // 已售
    }
  }
}
```

**实现思路**：
```javascript
// 1. 获取 openid
const wxContext = cloud.getWXContext()
const openid = wxContext.OPENID

// 2. 聚合查询 items 集合
const items = await db.collection('items').where({ userId: openid }).get()

// 3. 聚合查询 favorites 集合
const favorites = await db.collection('favorites').where({ userId: openid }).get()

// 4. 计算总览数据
const totalItems = items.data.length
const totalValue = items.data.reduce((sum, item) => sum + item.price, 0)
const avgPrice = totalItems > 0 ? totalValue / totalItems : 0

// 5. 计算本月数据
const monthStart = getMonthStart()
const monthItems = items.data.filter(item => item.createTime >= monthStart).length

// 6. 按分类统计
const categoryMap = {}
items.data.forEach(item => {
  if (!categoryMap[item.category]) {
    categoryMap[item.category] = { count: 0, totalPrice: 0 }
  }
  categoryMap[item.category].count++
  categoryMap[item.category].totalPrice += item.price
})

// 7. 最近7天趋势
const weekTrend = []
for (let i = 6; i >= 0; i--) {
  const date = new Date()
  date.setDate(date.getDate() - i)
  const dateStr = formatDate(date)
  const count = items.data.filter(item => 
    formatDate(new Date(item.createTime)) === dateStr
  ).length
  weekTrend.push({ date: dateStr, count })
}

// 8. 状态分布
const statusStats = {
  onSale: items.data.filter(item => item.status === 'onSale').length,
  sold: items.data.filter(item => item.status === 'sold').length
}

// 9. 返回数据
return { success: true, data: { ... } }
```

### 4.3 云函数部署步骤（您需要操作）

1. 在微信开发者工具中，右键 `cloudfunctions` 文件夹
2. 新建文件夹 `getStats`
3. 创建 `index.js`、`package.json`、`config.json` 三个文件
4. 右键 `getStats` 文件夹 → 上传并部署（云端安装依赖）
5. 等待部署完成

---

## 5. 页面设计

### 5.1 新增页面：pages/stats/index（数据统计页）

#### 功能模块

**模块 1：数据概览卡片**
- 显示 4 个核心数据：
  - 发布总数
  - 收藏总数
  - 平均价格
  - 物品总价值

**模块 2：按分类统计**
- 横向柱状图展示各分类的物品数量
- 显示每个分类的平均价格

**模块 3：最近 7 天发布趋势**
- 折线图或柱状图展示发布活动
- 体现数据变化趋势

**模块 4：状态分布**
- 在售 / 已售 比例
- 简单的进度条展示

#### 页面结构（WXML）

```html
<view class="container">
  <!-- 概览卡片 -->
  <view class="overview-grid">
    <view class="overview-card">
      <text class="card-value">{{stats.totalItems}}</text>
      <text class="card-label">发布总数</text>
    </view>
    <view class="overview-card">
      <text class="card-value">{{stats.totalFavorites}}</text>
      <text class="card-label">收藏总数</text>
    </view>
    <view class="overview-card">
      <text class="card-value">¥{{stats.avgPrice}}</text>
      <text class="card-label">平均价格</text>
    </view>
    <view class="overview-card">
      <text class="card-value">¥{{stats.totalValue}}</text>
      <text class="card-label">总价值</text>
    </view>
  </view>

  <!-- 本月数据 -->
  <view class="section">
    <view class="section-title">本月数据</view>
    <view class="month-stats">
      <view class="month-item">
        <text class="month-value">{{stats.monthItems}}</text>
        <text class="month-label">本月发布</text>
      </view>
      <view class="month-item">
        <text class="month-value">{{stats.monthFavorites}}</text>
        <text class="month-label">本月收藏</text>
      </view>
    </view>
  </view>

  <!-- 分类统计 -->
  <view class="section">
    <view class="section-title">分类统计</view>
    <view class="category-stats">
      <view class="category-bar" wx:for="{{stats.categoryStats}}" wx:key="category">
        <view class="category-name">{{item.category}}</view>
        <view class="category-progress">
          <view class="category-fill" style="width: {{item.percentage}}%"></view>
        </view>
        <view class="category-info">
          <text>{{item.count}}件</text>
          <text>均价¥{{item.avgPrice}}</text>
        </view>
      </view>
    </view>
  </view>

  <!-- 7天趋势 -->
  <view class="section">
    <view class="section-title">最近7天发布</view>
    <view class="trend-chart">
      <view class="trend-bar" wx:for="{{stats.weekTrend}}" wx:key="date">
        <view class="trend-fill" style="height: {{item.percentage}}%"></view>
        <text class="trend-date">{{item.dateLabel}}</text>
      </view>
    </view>
  </view>

  <!-- 状态分布 -->
  <view class="section">
    <view class="section-title">状态分布</view>
    <view class="status-stats">
      <view class="status-item">
        <text class="status-label">在售</text>
        <view class="status-bar">
          <view class="status-fill on-sale" style="width: {{stats.statusStats.onSalePercent}}%"></view>
        </view>
        <text class="status-value">{{stats.statusStats.onSale}}</text>
      </view>
      <view class="status-item">
        <text class="status-label">已售</text>
        <view class="status-bar">
          <view class="status-fill sold" style="width: {{stats.statusStats.soldPercent}}%"></view>
        </view>
        <text class="status-value">{{stats.statusStats.sold}}</text>
      </view>
    </view>
  </view>
</view>
```

### 5.2 现有页面增强

#### pages/index/index 增强
- **按日期排序**：列表支持按发布时间排序（最新/最早）
- **时间筛选**：增加"今日"、"本周"、"本月"快捷筛选
- **下拉刷新**：确保数据实时同步

#### pages/mine/index 增强
- **添加统计入口**：在"我的"页面添加"数据统计"菜单项
- **添加数据导出**（可选）：导出我的发布数据

### 5.3 app.json 更新

需要在 `pages` 数组中新增：
```json
"pages/stats/index"
```

---

## 6. UI 设计规范

### 6.1 配色方案
- **主色**：`#07C160`（微信绿）
- **辅助色**：`#1296DB`（蓝色，用于图表）
- **背景色**：`#F5F5F5`
- **卡片背景**：`#FFFFFF`
- **文字主色**：`#333333`
- **文字次色**：`#999999`

### 6.2 统计页布局
- 卡片化设计，圆角 `16rpx`
- 卡片间距 `20rpx`
- 内边距 `30rpx`
- 标题字号 `32rpx`，加粗
- 数值字号 `48rpx`，加粗，主色
- 标签字号 `24rpx`，灰色

### 6.3 图表设计
- 使用 **CSS 进度条** 而非图表库（轻量、兼容性好）
- 柱状图：高度按比例计算
- 横向条形：宽度按比例计算
- 颜色：主色 + 辅助色组合

---

## 7. 验收标准

### 7.1 必须实现（课前验收）
- [x] 添加功能：表单页面提交物品 → `pages/publish/index`
- [x] 列表展示：从云数据库读取记录 → `pages/index/index`
- [x] 数据上云：云函数写入数据库 → `cloudfunctions/createItem` 等
- [x] 至少 2 个页面：6 个页面 + 1 个新增统计页

### 7.2 加分项
- [x] 删除/编辑：`pages/my-items/index`
- [x] 按条件筛选：`pages/index/index`（搜索、分类、日期）
- [x] **数据统计展示**：`pages/stats/index`（本次升级重点）

### 7.3 升级验收点
- [ ] `getStats` 云函数部署成功，可正常调用
- [ ] 统计页能正常加载并显示数据
- [ ] 各模块数据计算正确（总数、平均、分类、趋势、状态）
- [ ] 页面样式美观，符合 UI 规范
- [ ] 数据刷新流畅，无明显卡顿
- [ ] 换设备登录后统计数据一致

---

## 8. 开发步骤

### 步骤 1：环境准备（您操作）
1. 打开微信开发者工具，导入项目
2. 进入云开发控制台
3. （可选）创建 `stats` 集合并设置权限和索引

### 步骤 2：部署云函数（您操作）
1. 在 `cloudfunctions` 目录创建 `getStats` 文件夹
2. 创建 `index.js`、`package.json`、`config.json`
3. 右键 → 上传并部署（云端安装依赖）

### 步骤 3：编写代码（执行阶段）
1. 创建 `pages/stats/index` 页面（wxml/wxss/js/json）
2. 更新 `pages/index/index`（按日期排序、时间筛选）
3. 更新 `pages/mine/index`（添加统计入口）
4. 更新 `miniprogram/app.json`（注册统计页）

### 步骤 4：测试验证（您操作）
1. 编译预览小程序
2. 发布几个物品，让数据丰富
3. 收藏几个物品
4. 进入统计页，验证数据正确性
5. 切换设备登录，验证数据同步

### 步骤 5：提交代码
1. `git add .`
2. `git commit -m "feat: 新增数据统计功能，体现云开发作用"`
3. `git push origin main`

---

## 9. 风险评估

| 风险 | 影响 | 应对方案 |
|------|------|---------|
| 统计数据量大导致查询慢 | 中 | 仅查询当前用户数据，已建索引 |
| 日期格式化跨时区问题 | 低 | 使用本地时间格式化 |
| 图表在小程序兼容性 | 低 | 使用纯 CSS 实现 |
| 数据为空的处理 | 低 | 显示空状态提示 |

---

## 10. 后续优化方向

- 引入 `wx-charts` 图表库（更丰富的图表）
- 数据可视化大屏（管理员视角）
- 数据导出为 Excel
- 智能推荐（基于用户偏好）
- 实时聊天（点对点通信）
- 消息推送（订单状态变更）

---

## 11. 文件清单

### 11.1 新增文件
- `cloudfunctions/getStats/index.js`
- `cloudfunctions/getStats/package.json`
- `cloudfunctions/getStats/config.json`
- `miniprogram/pages/stats/index.wxml`
- `miniprogram/pages/stats/index.wxss`
- `miniprogram/pages/stats/index.js`
- `miniprogram/pages/stats/index.json`

### 11.2 修改文件
- `miniprogram/app.json`（注册新页面）
- `miniprogram/pages/mine/index.wxml`（添加统计入口）
- `miniprogram/pages/mine/index.js`（添加跳转方法）
- `miniprogram/pages/index/index.js`（按日期排序）
- `miniprogram/pages/index/index.wxml`（时间筛选 UI）

---

**方案版本**：v2.0
**创建时间**：2026-06-24
**适用范围**：第二次课"方向二：实用工具"课前验收 + 加分项
