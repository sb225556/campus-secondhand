const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { itemId, name, description, category, price, images, contact, status } = event;

  if (!itemId) {
    return {
      success: false,
      error: '缺少物品ID',
    };
  }

  try {
    const item = await db.collection('items').doc(itemId).get();

    if (item.data.userId !== OPENID) {
      return {
        success: false,
        error: '无权限修改此物品',
      };
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = Number(price);
    if (images !== undefined) updateData.images = images;
    if (contact !== undefined) updateData.contact = contact;
    if (status !== undefined) updateData.status = status;
    updateData.updateTime = Date.now();

    await db.collection('items').doc(itemId).update({
      data: updateData,
    });

    return {
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
};