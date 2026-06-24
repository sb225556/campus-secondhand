const app = getApp();

Page({
  data: {
    keyword: '',
    currentCategory: '',
    currentTimeRange: 'all',
    sortOrder: 'desc',
    categories: [
      { name: '数码产品' },
      { name: '图书教材' },
      { name: '生活用品' },
      { name: '运动户外' },
      { name: '服饰鞋包' },
      { name: '其他' },
    ],
    timeRanges: [
      { value: 'all', label: '全部' },
      { value: 'today', label: '今日' },
      { value: 'week', label: '本周' },
      { value: 'month', label: '本月' },
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

  onTimeRangeChange(e) {
    const range = e.currentTarget.dataset.range;
    this.setData({
      currentTimeRange: range,
      pageNum: 1,
      items: [],
      hasMore: true,
    });
    this.loadItems();
  },

  onSortToggle() {
    const newOrder = this.data.sortOrder === 'desc' ? 'asc' : 'desc';
    this.setData({
      sortOrder: newOrder,
      pageNum: 1,
      items: [],
      hasMore: true,
    });
    this.loadItems();
  },

  getTimeRangeStart() {
    const now = new Date();
    const range = this.data.currentTimeRange;
    if (range === 'today') {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    }
    if (range === 'week') {
      const day = now.getDay() || 7;
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1).getTime();
    }
    if (range === 'month') {
      return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    }
    return 0;
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
          sortBy: 'createTime',
          sortOrder: this.data.sortOrder,
        },
      });

      if (result.result.success) {
        let newItems = result.result.list;
        const rangeStart = this.getTimeRangeStart();
        if (rangeStart > 0) {
          newItems = newItems.filter(item => (item.createTime || 0) >= rangeStart);
        }
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