Page({
  data: {
    items: [],
    pageNum: 1,
    pageSize: 10,
    loading: false,
    hasMore: true,
  },

  onLoad() {
    this.loadItems();
  },

  onShow() {
    this.loadItems();
  },

  async loadItems() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const result = await wx.cloud.callFunction({
        name: 'getMyFavorites',
        data: {
          pageNum: this.data.pageNum,
          pageSize: this.data.pageSize,
        },
      });

      if (result.result.success) {
        const newItems = result.result.list;
        this.setData({
          items: this.data.pageNum === 1 ? newItems : [...this.data.items, ...newItems],
          hasMore: newItems.length === this.data.pageSize,
        });
      }
    } catch (err) {
      console.error('获取我的收藏失败:', err);
      wx.showToast({
        title: '获取失败',
        icon: 'none',
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  onLoadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({
        pageNum: this.data.pageNum + 1,
      });
      this.loadItems();
    }
  },

  onItemTap(e) {
    const itemId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/index?id=${itemId}`,
    });
  },

  async onRemove(e) {
    const itemId = e.currentTarget.dataset.id;

    try {
      const result = await wx.cloud.callFunction({
        name: 'toggleFavorite',
        data: { itemId },
      });

      if (result.result.success) {
        wx.showToast({
          title: '取消收藏',
          icon: 'none',
        });
        this.setData({
          pageNum: 1,
          items: [],
          hasMore: true,
        });
        this.loadItems();
      } else {
        wx.showToast({
          title: result.result.error || '操作失败',
          icon: 'none',
        });
      }
    } catch (err) {
      console.error('取消收藏失败:', err);
      wx.showToast({
        title: '操作失败',
        icon: 'none',
      });
    }
  },
});