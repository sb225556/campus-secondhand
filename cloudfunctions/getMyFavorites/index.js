const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { pageSize = 10, pageNum = 1 } = event;

  try {
    const favorites = await db.collection('favorites')
      .where({
        userId: OPENID,
      })
      .orderBy('createTime', 'desc')
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .get();

    const itemIds = favorites.data.map(f => f.itemId);

    let items = [];
    if (itemIds.length > 0) {
      items = await db.collection('items')
        .where({
          _id: db.command.in(itemIds),
        })
        .get();
    }

    const countResult = await db.collection('favorites')
      .where({
        userId: OPENID,
      })
      .count();

    return {
      success: true,
      list: items.data,
      total: countResult.total,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
};