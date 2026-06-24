# 校园二手物交换小程序 - 第三次课升级方案

## Overview
- **Summary**: 按照第三次课通用能力要求，对校园二手物交换小程序进行功能升级，重点完善用户身份展示、加载状态与错误处理、分享功能、设置页面，以及新增 getImageUrl 云函数处理多人共享图片。
- **Purpose**: 满足第三次课验收标准，提升小程序的用户体验和完整性，体现云开发的完整能力（数据库、云函数、云存储）。
- **Target Users**: 校园师生用户

## Goals
- 完善用户登录与身份识别，在首页显示用户信息
- 新增 getImageUrl 云函数，处理多人共享图片的临时链接转换
- 完善加载状态与错误处理，统一交互体验
- 实现分享功能，支持分享给微信好友
- 创建设置页面，提供清除缓存等功能
- 新增反馈页面，收集用户意见

## Non-Goals (Out of Scope)
- 不实现实时聊天功能
- 不实现支付功能
- 不实现管理员后台
- 不重构已有页面架构

## Background & Context
- 项目已完成前两次课功能：物品发布、列表展示、数据上云、编辑删除、搜索筛选、数据统计
- 当前已有7个页面：首页、发布、详情、我的、我的发布、我的收藏、统计
- 云函数已实现9个：login、createItem、updateItem、deleteItem、getItems、getItemDetail、toggleFavorite、getMyItems、getMyFavorites、getStats
- 数据库集合：items、favorites、users

## Functional Requirements

### FR-1: 用户身份展示增强
- 首页顶部显示当前登录用户的头像和昵称
- 用户信息从 app.globalData 读取
- 点击用户头像可进入「我的」页面

### FR-2: getImageUrl 云函数（多人共享图片）
- 云函数名：getImageUrl
- 功能：接收 fileID 数组，返回临时访问链接
- 使用 cloud.getTempFileURL 方法
- 用于详情页、列表页图片的实时链接转换
- 确保多人共享图片可正常访问

### FR-3: 加载状态与错误处理完善
- 所有数据加载页面统一显示 loading 状态
- 网络请求失败统一显示错误提示
- 支持点击重试功能
- 表单提交成功后显示 toast 反馈
- 下拉刷新功能

### FR-4: 分享功能
- 详情页支持分享给微信好友（onShareAppMessage）
- 分享卡片显示物品标题和图片
- 点击分享卡片可直接跳转到物品详情页

### FR-5: 设置页面
- 清除缓存功能
- 关于我们
- 意见反馈入口
- 版本信息显示
- 切换主题（加分项）

### FR-6: 反馈页面
- 反馈类型选择
- 反馈内容输入
- 联系方式选填
- 提交后保存到云数据库

## Non-Functional Requirements
- **NFR-1**: 所有页面加载状态响应时间 < 100ms
- **NFR-2**: 云函数调用失败时，错误提示清晰明确
- **NFR-3**: 图片加载失败时显示默认占位图
- **NFR-4**: 页面数量 ≥ 9（在原有基础上新增2个页面）

## Constraints
- **Technical**: 微信小程序原生框架、微信云开发
- **Business**: 符合微信小程序平台规范
- **Dependencies**: 微信云开发 SDK、微信小程序基础库 2.2.3+

## Assumptions
- 用户已授权登录，app.globalData 中有用户信息
- 云存储中已有物品图片，使用 fileID 存储
- 微信基础库版本支持 cloud.getTempFileURL

## Acceptance Criteria

### AC-1: 首页用户身份展示
- **Given**: 用户已登录小程序
- **When**: 进入首页
- **Then**: 页面顶部显示用户头像和昵称
- **Verification**: `human-judgment`

### AC-2: getImageUrl 云函数
- **Given**: 有云存储的 fileID
- **When**: 调用 getImageUrl 云函数，传入 fileID 数组
- **Then**: 返回对应的临时访问链接数组
- **Verification**: `programmatic`

### AC-3: 详情页图片使用临时链接
- **Given**: 进入物品详情页
- **When**: 页面加载完成
- **Then**: 图片通过 getImageUrl 获取临时链接后显示
- **Verification**: `human-judgment`

### AC-4: 加载状态统一
- **Given**: 页面正在加载数据
- **When**: 数据请求中
- **Then**: 显示 loading 提示
- **Verification**: `human-judgment`

### AC-5: 错误处理
- **Given**: 网络请求失败
- **When**: 发生错误
- **Then**: 显示错误提示 toast
- **Verification**: `human-judgment`

### AC-6: 分享功能
- **Given**: 在物品详情页
- **When**: 用户点击右上角分享
- **Then**: 弹出分享面板，分享卡片包含物品信息
- **Verification**: `human-judgment`

### AC-7: 设置页面
- **Given**: 进入设置页面
- **When**: 页面加载完成
- **Then**: 显示清除缓存、关于、意见反馈等选项
- **Verification**: `human-judgment`

### AC-8: 清除缓存功能
- **Given**: 在设置页面
- **When**: 点击清除缓存
- **Then**: 清除本地缓存并提示成功
- **Verification**: `programmatic`

### AC-9: 反馈页面
- **Given**: 在反馈页面填写内容
- **When**: 点击提交
- **Then**: 保存到云数据库并提示成功
- **Verification**: `programmatic`

### AC-10: 页面数量达标
- **Given**: 小程序已完成所有功能
- **When**: 统计页面数量
- **Then**: 页面数量 ≥ 9
- **Verification**: `programmatic`

## Open Questions
- [ ] 主题切换功能是否需要实现？（可选加分项）
- [ ] 反馈页面是否需要上传图片？（可选增强）
