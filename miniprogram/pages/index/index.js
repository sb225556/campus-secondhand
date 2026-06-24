const app = getApp();

Page({
  data: {
    keyword: '',
    currentCategory: '',
    categories: [
      { name: '数码产品' },
      { name: '图书教材' },
      { name: '生活用品' },
      { name: '运动户外' },
      { name: '服饰鞋包' },
      { name: '其他' },
    ],
    items: [],
    pageNum: 1,
    pageSize: 10,
    loading: false,
    hasMore: true,
  },

  onLoad() {
    this.login();
    this.loadItems();
  },

  onShow() {
    this.loadItems();
  },

  async login() {
    try {
      const userInfo = await this.getUserInfo();
      const result = await wx.cloud.callFunction({
        name: 'login',
        data: {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
        },
      });

      if (result.result.success) {
        app.globalData.openid = result.result.openid;
        app.globalData.userInfo = result.result.userInfo;
      }
    } catch (err) {
      console.error('登录失败:', err);
    }
  },

  getUserInfo() {
    return new Promise((resolve) => {
      wx.getUserProfile({
        desc: '用于完善会员资料',
        success: (res) => {
          resolve(res.userInfo);
        },
        fail: () => {
          resolve({ nickName: '用户', avatarUrl: '' });
        },
      });
    });
  },

  onKeywordInput(e) {
    this.setData({
      keyword: e.detail.value,
    });
  },

  onSearch() {
    this.setData({
      pageNum: 1,
      items: [],
      hasMore: true,
    });
    this.loadItems();
  },

  onCategoryChange(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      currentCategory: category,
      pageNum: 1,
      items: [],
      hasMore: true,
    });
    this.loadItems();
  },

  async loadItems() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const result = await wx.cloud.callFunction({
        name: 'getItems',
        data: {
          category: this.data.currentCategory || undefined,
          keyword: this.data.keyword || undefined,
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
      console.error('获取物品列表失败:', err);
      wx.showToast({
        title: '获取失败',
        icon: 'none',
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  onRefresh() {
    this.setData({
      pageNum: 1,
      items: [],
      hasMore: true,
    });
    this.loadItems();
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
});