const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { type, content, contact, userName, images = [] } = event;

  try {
    if (!content || !content.trim()) {
      return {
        success: false,
        error: '反馈内容不能为空',
      };
    }

    const result = await db.collection('feedbacks').add({
      data: {
        type: type || '其他',
        content: content.trim(),
        contact: contact || '',
        userName: userName || '匿名用户',
        images: images,
        createTime: Date.now(),
      },
    });

    return {
      success: true,
      feedbackId: result._id,
    };
  } catch (err) {
    console.error('提交反馈失败:', err);
    return {
      success: false,
      error: err.message || '提交失败',
    };
  }
};
