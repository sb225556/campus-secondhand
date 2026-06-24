const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { name, description, category, price, images, contact, userName, userAvatar } = event;

  if (!name || !description || !category || !price || !images || !contact) {
    return {
      success: false,
      error: '缺少必填字段',
    };
  }

  try {
    const result = await db.collection('items').add({
      data: {
        name,
        description,
        category,
        price: Number(price),
        images,
        userId: OPENID,
        userName: userName || '用户',
        userAvatar: userAvatar || '',
        contact,
        status: 'available',
        createTime: Date.now(),
        updateTime: Date.now(),
      },
    });

    return {
      success: true,
      _id: result._id,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
};