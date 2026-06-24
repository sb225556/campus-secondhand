const app = getApp();

Page({
  data: {
    item: {},
    isFavorite: false,
    itemId: '',
  },

  onLoad(options) {
    this.setData({
      itemId: options.id,
    });
    this.loadItem();
  },

  async loadItem() {
    wx.showLoading({ title: '加载中...' });

    try {
      const result = await wx.cloud.callFunction({
        name: 'getItemDetail',
        data: { itemId: this.data.itemId },
      });

      if (result.result.success) {
        this.setData({
          item: result.result.item,
          isFavorite: result.result.isFavorite,
        });
      } else {
        wx.showToast({
          title: result.result.error || '获取失败',
          icon: 'none',
        });
      }
    } catch (err) {
      console.error('获取物品详情失败:', err);
      wx.showToast({
        title: '获取失败',
        icon: 'none',
      });
    } finally {
      wx.hideLoading();
    }
  },

  async onToggleFavorite() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'toggleFavorite',
        data: { itemId: this.data.itemId },
      });

      if (result.result.success) {
        this.setData({
          isFavorite: result.result.isFavorite,
        });
        wx.showToast({
          title: result.result.isFavorite ? '收藏成功' : '取消收藏',
          icon: 'none',
        });
      } else {
        wx.showToast({
          title: result.result.error || '操作失败',
          icon: 'none',
        });
      }
    } catch (err) {
      console.error('收藏操作失败:', err);
      wx.showToast({
        title: '操作失败',
        icon: 'none',
      });
    }
  },

  onContact() {
    wx.showModal({
      title: '联系方式',
      content: `发布者联系方式：${this.data.item.contact}`,
      showCancel: false,
    });
  },

  onCopyContact() {
    wx.setClipboardData({
      data: this.data.item.contact,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'success',
        });
      },
    });
  },

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },
});