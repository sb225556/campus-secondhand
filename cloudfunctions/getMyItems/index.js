const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { pageSize = 10, pageNum = 1 } = event;

  try {
    const countResult = await db.collection('items')
      .where({
        userId: OPENID,
      })
      .count();

    const list = await db.collection('items')
      .where({
        userId: OPENID,
      })
      .orderBy('createTime', 'desc')
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .get();

    return {
      success: true,
      list: list.data,
      total: countResult.total,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
};