# 校园二手物交换小程序 - 第三次课升级任务列表

## 数据库集合新增

### feedbacks 集合（反馈）
- **权限设置**：仅创建者可写，仅创建者可读
- **字段说明**：
  - `_id`: 反馈ID（自动生成）
  - `_openid`: 用户openid（自动生成）
  - `type`: 反馈类型（功能建议、Bug反馈、其他）
  - `content`: 反馈内容
  - `contact`: 联系方式（可选）
  - `userName`: 用户昵称
  - `createTime`: 创建时间
- **索引**：
  - `_id`（唯一，默认）
  - `createTime`（非唯一，升序）

---

## 云函数新增

### getImageUrl 云函数
- **功能**：接收 fileID 数组，返回临时访问链接
- **输入**：{ fileList: string[] }
- **输出**：{ success: boolean, tempFileList: string[] }
- **使用方法**：cloud.getTempFileURL
- **权限**：所有用户可调用

### submitFeedback 云函数
- **功能**：提交用户反馈到数据库
- **输入**：{ type, content, contact, userName }
- **输出**：{ success: boolean, feedbackId: string }
- **权限**：所有用户可调用

---

## 任务列表

## [ ] Task 1: 创建 getImageUrl 云函数
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 创建 cloudfunctions/getImageUrl/ 目录
  - 实现 index.js，使用 cloud.getTempFileURL 获取临时链接
  - 创建 package.json 和 config.json
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-1.1: 传入 fileID 数组，返回对应的 tempURL 数组
  - `programmatic` TR-1.2: 传入空数组，返回空数组
  - `human-judgement` TR-1.3: 云函数代码结构清晰，错误处理完善
- **Notes**: 参考微信云开发文档：cloud.getTempFileURL

## [ ] Task 2: 创建 submitFeedback 云函数
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - 创建 cloudfunctions/submitFeedback/ 目录
  - 实现 index.js，将反馈保存到 feedbacks 集合
  - 创建 package.json 和 config.json
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `programmatic` TR-2.1: 提交反馈后，数据库中有对应记录
  - `programmatic` TR-2.2: 反馈记录包含 _openid 和 createTime
  - `human-judgement` TR-2.3: 云函数代码结构清晰
- **Notes**: 需要先在云开发控制台创建 feedbacks 集合

## [ ] Task 3: 首页添加用户身份展示
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 修改 pages/index/index.wxml，顶部添加用户头像和昵称
  - 修改 pages/index/index.js，从 app.globalData 读取用户信息
  - 修改 pages/index/index.wxss，添加用户信息栏样式
  - 点击用户头像跳转到「我的」页面
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgement` TR-3.1: 首页顶部显示用户头像和昵称
  - `human-judgement` TR-3.2: 点击头像跳转到我的页面
  - `programmatic` TR-3.3: 用户信息从 app.globalData 正确读取
- **Notes**: 未登录时显示默认头像和"点击登录"

## [ ] Task 4: 详情页图片使用临时链接 + 分享功能
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 修改 pages/detail/index.js，加载详情后调用 getImageUrl 获取临时链接
  - 修改 pages/detail/index.wxml，使用临时链接显示图片
  - 添加 onShareAppMessage 方法实现分享功能
  - 分享卡片显示物品标题和首图
- **Acceptance Criteria Addressed**: AC-3, AC-6
- **Test Requirements**:
  - `human-judgement` TR-4.1: 详情页图片正常显示
  - `human-judgement` TR-4.2: 点击右上角分享弹出分享面板
  - `human-judgement` TR-4.3: 分享卡片包含物品标题和图片
  - `programmatic` TR-4.4: 分享路径包含物品ID参数
- **Notes**: 分享路径格式：/pages/detail/index?id=xxx

## [ ] Task 5: 创建设置页面
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 创建 pages/settings/index.wxml
  - 创建 pages/settings/index.js
  - 创建 pages/settings/index.wxss
  - 创建 pages/settings/index.json
  - 功能项：清除缓存、意见反馈、关于我们、版本信息
  - 清除缓存使用 wx.clearStorageSync
- **Acceptance Criteria Addressed**: AC-7, AC-8
- **Test Requirements**:
  - `human-judgement` TR-5.1: 设置页面布局清晰
  - `programmatic` TR-5.2: 点击清除缓存成功清除本地存储
  - `human-judgement` TR-5.3: 清除缓存后显示成功提示
  - `human-judgement` TR-5.4: 点击意见反馈跳转到反馈页
- **Notes**: 版本号显示为 v1.2.0

## [ ] Task 6: 创建反馈页面
- **Priority**: medium
- **Depends On**: Task 2
- **Description**:
  - 创建 pages/feedback/index.wxml
  - 创建 pages/feedback/index.js
  - 创建 pages/feedback/index.wxss
  - 创建 pages/feedback/index.json
  - 功能：反馈类型选择、内容输入、联系方式、提交按钮
  - 提交调用 submitFeedback 云函数
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `human-judgement` TR-6.1: 反馈页面表单完整
  - `programmatic` TR-6.2: 提交成功后数据保存到数据库
  - `human-judgement` TR-6.3: 提交成功显示 toast 提示
  - `human-judgement` TR-6.4: 表单验证（内容不能为空）
- **Notes**: 反馈类型：功能建议、Bug反馈、其他

## [ ] Task 7: 完善加载状态与错误处理
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - 检查所有页面的 loading 状态
  - 统一错误提示文案和样式
  - 首页添加下拉刷新功能（onPullDownRefresh）
  - 图片加载失败显示默认占位图
- **Acceptance Criteria Addressed**: AC-4, AC-5
- **Test Requirements**:
  - `human-judgement` TR-7.1: 数据加载时显示 loading
  - `human-judgement` TR-7.2: 网络错误显示友好提示
  - `human-judgement` TR-7.3: 下拉刷新功能正常
  - `human-judgement` TR-7.4: 图片加载失败显示默认图
- **Notes**: 下拉刷新需在 page.json 中开启 enablePullDownRefresh

## [ ] Task 8: 注册新页面并更新导航
- **Priority**: high
- **Depends On**: Task 5, Task 6
- **Description**:
  - 在 app.json 的 pages 数组中添加 settings 和 feedback 页面
  - 在我的页面添加「设置」入口
  - 在设置页面添加「意见反馈」入口
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `programmatic` TR-8.1: app.json 中包含新页面路径
  - `human-judgement` TR-8.2: 我的页面有设置入口
  - `human-judgement` TR-8.3: 设置页面有反馈入口
  - `programmatic` TR-8.4: 页面总数 ≥ 9
- **Notes**: 页面路径：pages/settings/index、pages/feedback/index

## [ ] Task 9: 部署云函数并测试
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**:
  - 部署 getImageUrl 云函数
  - 部署 submitFeedback 云函数
  - 在微信开发者工具中测试所有功能
- **Acceptance Criteria Addressed**: AC-2, AC-9
- **Test Requirements**:
  - `programmatic` TR-9.1: getImageUrl 云函数部署成功
  - `programmatic` TR-9.2: submitFeedback 云函数部署成功
  - `human-judgement` TR-9.3: 所有功能正常运行
- **Notes**: 需在云开发控制台创建 feedbacks 集合

## [ ] Task 10: 提交代码到 GitHub
- **Priority**: low
- **Depends On**: Task 9
- **Description**:
  - 使用 git 提交所有修改
  - 推送到 GitHub 仓库
- **Acceptance Criteria Addressed**: 无
- **Test Requirements**:
  - `programmatic` TR-10.1: git push 成功
  - `programmatic` TR-10.2: GitHub 仓库代码更新
- **Notes**: commit message: feat: 第三次课功能升级

---

# Task Dependencies
- [Task 4] depends on [Task 1]
- [Task 6] depends on [Task 2]
- [Task 8] depends on [Task 5, Task 6]
- [Task 9] depends on [Task 1, Task 2]
- [Task 10] depends on [Task 9]

可并行任务：
- Task 1、Task 2、Task 3 可并行
- Task 5、Task 7 可并行
