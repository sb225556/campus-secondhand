const app = getApp();

Page({
  data: {
    stats: {
      totalItems: 0,
      totalFavorites: 0,
      avgPrice: 0,
      totalValue: 0,
      monthItems: 0,
      monthFavorites: 0,
      monthValue: 0,
      categoryStats: [],
      weekTrend: [],
      statusStats: {
        onSale: 0,
        sold: 0,
        onSalePercent: 0,
        soldPercent: 0,
      },
    },
    hasTrend: false,
    loading: false,
  },

  onLoad() {
    this.loadStats();
  },

  onShow() {
    if (!this.data.loading) {
      this.loadStats();
    }
  },

  onPullDownRefresh() {
    this.loadStats().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadStats() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      const result = await wx.cloud.callFunction({
        name: 'getStats',
      });

      if (result.result && result.result.success) {
        const data = result.result.data;
        const weekTrend = (data.weekTrend || []).map(d => ({
          ...d,
          // 防止百分比为 0 时柱子看不到
          percentage: d.count === 0 ? 0 : Math.max(d.percentage, 4),
        }));
        this.setData({
          stats: {
            ...data,
            weekTrend,
          },
          hasTrend: weekTrend.some(d => d.count > 0),
        });
      } else {
        wx.showToast({
          title: result.result?.error || '加载失败',
          icon: 'none',
        });
      }
    } catch (err) {
      console.error('加载统计失败:', err);
      wx.showToast({
        title: '网络异常',
        icon: 'none',
      });
    } finally {
      this.setData({ loading: false });
    }
  },
});
