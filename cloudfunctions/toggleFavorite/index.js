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
    const favoriteResult = await db.collection('favorites')
      .where({
        userId: OPENID,
        itemId,
      })
      .get();

    if (favoriteResult.data.length > 0) {
      await db.collection('favorites')
        .where({
          userId: OPENID,
          itemId,
        })
        .remove();

      return {
        success: true,
        isFavorite: false,
      };
    } else {
      await db.collection('favorites').add({
        data: {
          userId: OPENID,
          itemId,
          createTime: Date.now(),
        },
      });

      return {
        success: true,
        isFavorite: true,
      };
    }
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
};