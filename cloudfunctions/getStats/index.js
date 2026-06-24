const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

// 格式化日期为 YYYY-MM-DD
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 获取本月开始时间戳
function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();

  try {
    // 1. 查询当前用户所有发布的物品
    const itemsRes = await db.collection('items')
      .where({ userId: OPENID })
      .get();
    const items = itemsRes.data || [];

    // 2. 查询当前用户所有收藏
    const favoritesRes = await db.collection('favorites')
      .where({ userId: OPENID })
      .get();
    const favorites = favoritesRes.data || [];

    // 3. 总览数据
    const totalItems = items.length;
    const totalFavorites = favorites.length;
    const totalValue = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const avgPrice = totalItems > 0 ? Math.round((totalValue / totalItems) * 100) / 100 : 0;

    // 4. 本月数据
    const monthStart = getMonthStart();
    const monthItemsList = items.filter(item => (item.createTime || 0) >= monthStart);
    const monthFavoritesList = favorites.filter(item => (item.createTime || 0) >= monthStart);
    const monthItems = monthItemsList.length;
    const monthFavorites = monthFavoritesList.length;
    const monthValue = monthItemsList.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

    // 5. 按分类统计
    const categoryMap = {};
    items.forEach(item => {
      const cat = item.category || '其他';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { count: 0, totalPrice: 0 };
      }
      categoryMap[cat].count += 1;
      categoryMap[cat].totalPrice += Number(item.price) || 0;
    });
    const categoryStats = Object.keys(categoryMap).map(cat => {
      const data = categoryMap[cat];
      return {
        category: cat,
        count: data.count,
        avgPrice: data.count > 0 ? Math.round((data.totalPrice / data.count) * 100) / 100 : 0,
        percentage: totalItems > 0 ? Math.round((data.count / totalItems) * 100) : 0,
      };
    }).sort((a, b) => b.count - a.count);

    // 6. 最近 7 天发布趋势
    const weekTrend = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      const dayItems = items.filter(item => formatDate(new Date(item.createTime)) === dateStr);
      const dayCount = dayItems.length;
      weekTrend.push({
        date: dateStr,
        dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
        count: dayCount,
        percentage: 0, // 前端按当前周最大值计算
      });
    }
    // 计算周内每天的占比（前端可重新计算，这里给出基于本用户总数的参考）
    const weekTotal = weekTrend.reduce((sum, d) => sum + d.count, 0);
    weekTrend.forEach(d => {
      d.percentage = weekTotal > 0 ? Math.round((d.count / weekTotal) * 100) : 0;
    });

    // 7. 状态分布
    const onSale = items.filter(item => !item.status || item.status === 'available' || item.status === 'onSale').length;
    const sold = items.filter(item => item.status === 'sold').length;
    const total = onSale + sold;
    const statusStats = {
      onSale,
      sold,
      onSalePercent: total > 0 ? Math.round((onSale / total) * 100) : 0,
      soldPercent: total > 0 ? Math.round((sold / total) * 100) : 0,
    };

    return {
      success: true,
      data: {
        totalItems,
        totalFavorites,
        avgPrice,
        totalValue,
        monthItems,
        monthFavorites,
        monthValue,
        categoryStats,
        weekTrend,
        statusStats,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
};
