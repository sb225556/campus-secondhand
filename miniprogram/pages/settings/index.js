const app = getApp();

Page({
  data: {
    currentTheme: 'light',
  },

  onLoad() {
    const savedTheme = wx.getStorageSync('theme') || 'light';
    this.setData({ currentTheme: savedTheme });
  },

  onClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除本地缓存吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync();
            wx.showToast({
              title: '清除成功',
              icon: 'success',
            });
          } catch (err) {
            wx.showToast({
              title: '清除失败',
              icon: 'none',
            });
          }
        }
      },
    });
  },

  onThemeChange() {
    const themeList = ['light', 'dark'];
    const currentIndex = themeList.indexOf(this.data.currentTheme);
    const nextIndex = (currentIndex + 1) % themeList.length;
    const newTheme = themeList[nextIndex];

    wx.setStorageSync('theme', newTheme);
    this.setData({ currentTheme: newTheme });

    wx.showToast({
      title: newTheme === 'light' ? '已切换到浅色模式' : '已切换到深色模式',
      icon: 'none',
    });
  },

  onFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/index',
    });
  },

  onAbout() {
    wx.showModal({
      title: '关于我们',
      content: '校园二手物交换 v1.2.0\n\n让闲置物品重获新生\n\n© 2026 Campus Secondhand',
      showCancel: false,
    });
  },
});
