const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { itemId } = event;

  if (!itemId) {
    return {
      success: false,
      error: '缺少物品ID',
    };
  }

  try {
    const item = await db.collection('items').doc(itemId).get();

    const favoriteResult = await db.collection('favorites')
      .where({
        userId: OPENID,
        itemId,
      })
      .get();

    return {
      success: true,
      item: item.data,
      isFavorite: favoriteResult.data.length > 0,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
};