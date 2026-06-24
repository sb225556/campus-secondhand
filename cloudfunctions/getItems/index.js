const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { category, keyword, pageSize = 10, pageNum = 1, sortBy = 'createTime', sortOrder = 'desc' } = event;

  try {
    let query = db.collection('items').where({
      status: 'available',
    });

    if (category) {
      query = query.where({
        category,
      });
    }

    if (keyword) {
      const regex = db.RegExp({
        regexp: keyword,
        options: 'i',
      });
      query = query.where({
        name: regex,
      });
    }

    const countResult = await query.count();
    const total = countResult.total;

    const list = await query
      .orderBy(sortBy, sortOrder)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .get();

    return {
      success: true,
      list: list.data,
      total,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
};