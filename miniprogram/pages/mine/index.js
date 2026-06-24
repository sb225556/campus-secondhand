const app = getApp();

Page({
  data: {
    userInfo: {},
    openid: '',
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    this.setData({
      userInfo: app.globalData.userInfo || {},
      openid: app.globalData.openid || '',
    });
  },

  onMyItems() {
    wx.navigateTo({
      url: '/pages/my-items/index',
    });
  },

  onMyFavorites() {
    wx.navigateTo({
      url: '/pages/my-favorites/index',
    });
  },

  onAbout() {
    wx.showModal({
      title: '关于我们',
      content: '校园二手物交换 - 让闲置物品重获新生',
      showCancel: false,
    });
  },
});